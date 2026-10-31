/* Manual offline calendar. Never invents elapsed time across a cold power loss. */
#include "offline.h"
#include <time.h>
#include <sys/time.h>
#include <stdlib.h>
#include <stdio.h>
static bool valid;
static bool editing;
static struct tm draft;
void of_clock_init(void){setenv("TZ","CST-8",1);tzset();valid=time(NULL)>=1704067200;}
bool of_clock_valid(void){return valid;}
bool of_clock_set_epoch(int64_t epoch){
 if(editing||epoch<1704067200LL||epoch>4102444799LL)return false;
 time_t seconds=(time_t)epoch;if((int64_t)seconds!=epoch)return false;
 struct timeval value={.tv_sec=seconds,.tv_usec=0};if(settimeofday(&value,NULL)!=0)return false;
 valid=true;of_state.last_clock_epoch=epoch;of_state_dirty();return true;
}
static struct tm fields(void){if(editing)return draft;time_t now=valid?time(NULL):(of_state.last_clock_epoch>=1704067200?of_state.last_clock_epoch:1767196800);struct tm t;localtime_r(&now,&t);return t;}
void of_clock_edit_begin(void){if(!editing){draft=fields();editing=true;}}
void of_clock_edit_cancel(void){editing=false;}
bool of_clock_edit_commit(void){if(!editing)return true;draft.tm_isdst=-1;draft.tm_sec=0;time_t epoch=mktime(&draft);if(epoch<1704067200)return false;struct timeval value={.tv_sec=epoch,.tv_usec=0};if(settimeofday(&value,NULL)!=0)return false;editing=false;valid=true;of_state.last_clock_epoch=epoch;of_state_dirty();return true;}
int of_clock_field(unsigned field){struct tm t=fields();switch(field){case 0:return t.tm_year+1900;case 1:return t.tm_mon+1;case 2:return t.tm_mday;case 3:return t.tm_hour;default:return t.tm_min;}}
void of_clock_adjust(unsigned field,int d){of_clock_edit_begin();struct tm t=draft;switch(field){case 0:t.tm_year+=d;if(t.tm_year<124)t.tm_year=199;if(t.tm_year>199)t.tm_year=124;break;case 1:t.tm_mon+=d;break;case 2:t.tm_mday+=d;break;case 3:t.tm_hour+=d;break;default:t.tm_min+=d;break;}t.tm_isdst=-1;t.tm_sec=0;time_t epoch=mktime(&t);if(epoch>=1704067200)draft=t;}
void of_clock_text(char *clock,size_t cs,char *date,size_t ds){if(valid){time_t now=time(NULL);struct tm t;localtime_r(&now,&t);strftime(clock,cs,"%H:%M",&t);static const char *cn[]={"周日","周一","周二","周三","周四","周五","周六"},*en[]={"SUN","MON","TUE","WED","THU","FRI","SAT"};char day[24];strftime(day,sizeof(day),"%m.%d",&t);snprintf(date,ds,"%s · %s · %s",of_text(cn[t.tm_wday],en[t.tm_wday]),day,of_text("海拉鲁","HYRULE"));}else{snprintf(clock,cs,"--:--");if(ds)date[0]=0;}}
