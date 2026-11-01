"""Set the device's offline clock from the PC over USB, with a checked reply.

No network, reset, flashing, dependency installation or port guessing.
Requires the existing ESP-IDF Python environment with pyserial.
"""
import argparse
from datetime import datetime, timedelta, timezone
import secrets
import sys
import time


def lines_until(port, deadline):
    pending = bytearray()
    while time.monotonic() < deadline:
        pending.extend(port.read(max(1, min(port.in_waiting, 4096))))
        if len(pending) > 16384:
            raise ValueError("Serial reply too long")
        while b"\n" in pending:
            line, _, rest = pending.partition(b"\n")
            pending = bytearray(rest)
            yield line.rstrip(b"\r")


def write_command(port, command):
    try:
        if port.write(command) != len(command):
            raise TimeoutError("Incomplete USB command write")
    except (OSError, TimeoutError):
        port.reset_output_buffer()
        raise


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--port", required=True, help="Selected device USB port, e.g. COM4")
    args = parser.parse_args()
    try:
        import serial
    except ImportError:
        parser.exit(1, "pyserial is missing; use the ESP-IDF Python environment.\n")
    try:
        with serial.Serial(port=None, baudrate=115200, timeout=0.2, write_timeout=5,
                           xonxoff=False, rtscts=False, dsrdtr=False) as port:
            port.dtr = False
            port.rts = False
            port.port = args.port
            port.open()
            port.reset_input_buffer()
            print(f"Checking time-sync firmware on {args.port}...", flush=True)
            write_command(port, b"\nSLATE_TIME_PING\n")
            for line in lines_until(port, time.monotonic() + 5):
                if line == b"@SLATE_TIME_READY 1 UNIX_UTC":
                    break
            else:
                raise TimeoutError("No time-sync readiness reply. Flash the firmware with USB time sync first.")
            nonce = secrets.token_hex(4)
            epoch = int(time.time())
            write_command(port, f"SLATE_TIME_SET {epoch} {nonce}\n".encode("ascii"))
            expected = f"@SLATE_TIME_OK 1 {nonce} {epoch}".encode("ascii")
            for line in lines_until(port, time.monotonic() + 5):
                if line == expected:
                    beijing = datetime.fromtimestamp(epoch, timezone(timedelta(hours=8)))
                    print(f"Time synchronized successfully. Device Beijing time: {beijing:%Y-%m-%d %H:%M:%S}")
                    print("The clock continues while powered, including when the screen is off.")
                    return 0
                if line.startswith(b"@SLATE_TIME_ERROR "):
                    raise ValueError(line.decode("ascii", errors="replace") + "; finish manual clock editing, then retry.")
            raise TimeoutError("No matching time-set acknowledgement; synchronization is not confirmed.")
    except (serial.SerialException, OSError, ValueError, TimeoutError) as error:
        print(f"Time sync failed: {error}", file=sys.stderr)
        print("Close idf.py monitor and other serial tools; confirm the selected port.", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
