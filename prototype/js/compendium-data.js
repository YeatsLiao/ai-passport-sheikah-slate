// 海拉鲁图鉴全量数据 · 由 tools/gen_compendium_js.py 生成,请勿手改
// 来源:Hyrule Compendium API(官方元数据)+ 中文译名整理 + 大师模式补充
const COMP_CATS = [
  { id: "creatures", label: "CREATURES", cn: "生物", cover: "cp_horse.png", art: "cat_creatures.png", have: 83, total: 83 },
  { id: "monsters", label: "MONSTERS", cn: "怪物", cover: "cp_bokoblin.png", art: "cat_monsters.png", have: 86, total: 86 },
  { id: "materials", label: "MATERIALS", cn: "材料", cover: "cp_apple.png", art: "cat_materials.png", have: 36, total: 36 },
  { id: "equipment", label: "EQUIPMENT", cn: "装备", cover: "cp_master_sword.png", art: "cat_equipment.png", have: 185, total: 185 },
  { id: "treasures", label: "TREASURE", cn: "宝物", cover: "cp_treasure_chest.png", art: "cat_treasures.png", have: 4, total: 4 }
];

const COMP_ENTRIES = {
  creatures: [
    {
      no: "001",
      name: "HORSE",
      cn: "马",
      img: "horse.png",
      got: true,
      meta: ["栖息地", "Hyrule Field"],
      desc: "These can most often be found on plains. Their usefulness as transportation has made them valuable since ancient times. That said, wild horses do tend to get spooked and run off when approached, so if you're looking to snag one, it's best to sneak up on it."
    },
    {
      no: "002",
      name: "GIANT HORSE",
      cn: "巨马",
      img: "giant_horse.png",
      got: true,
      desc: "This giant horse is the last of its kind. Its physical capabilities completely overshadow those of regular horses, but its temperament is extremely wild. Only a truly skilled rider can train, or even catch, this beast of a mount. This is a horse that chooses its rider."
    },
    {
      no: "003",
      name: "WHITE HORSE",
      cn: "白马",
      img: "white_horse.png",
      got: true,
      desc: "The Hyrulean royal family that perished 100 years ago would sometimes ride atop white horses as a display of their divine right. This white horse may be a descendant of one once ridden by royalty."
    },
    {
      no: "004",
      name: "LORD OF THE MOUNTAIN",
      cn: "山之霸主",
      img: "lord_of_the_mountain.png",
      got: true,
      meta: ["栖息地", "Satori Mountain"],
      desc: "This noble creature watches over all animals that make their homes in the forest. Legends say this holy creature is a reincarnation of a sage that died on the lands it now protects. It has an acute awareness of its surroundings, so it seldom appears before people. It's sometimes known by its other name, Satori"
    },
    {
      no: "005",
      name: "STALHORSE",
      cn: "骷髅马",
      img: "stalhorse.png",
      got: true,
      meta: ["栖息地", "Hebra Mountains"],
      desc: "This skeletal horse is ridden by monsters. It was once a regular horse, but Ganon's power revived it from death. It cannot maintain its bone structure in the daytime."
    },
    {
      no: "006",
      name: "DONKEY",
      cn: "驴",
      img: "donkey.png",
      got: true,
      meta: ["栖息地", "Greater Hyrule"],
      desc: "Smaller than horses, these are raised as livestock in the countryside, so they don't exist in the wild. They're more powerful than they look and specialize in transporting baggage. This has made them popular with traveling merchants."
    },
    {
      no: "007",
      name: "SAND SEAL",
      cn: "沙海象",
      img: "sand_seal.png",
      got: true,
      meta: ["栖息地", "Gerudo Desert"],
      desc: "These seals use their large flippers to move through the sand as if swimming. They were once wild animals but have since been domesticated by the Gerudo. They rely on their excellent hearing to find their way while riding submerged in the sand.Their large, distinct tusks look pretty ferocious, but their favorite food is actually fruit."
    },
    {
      no: "008",
      name: "PATRICIA",
      cn: "帕特丽夏",
      img: "patricia.png",
      got: true,
      meta: ["栖息地", "Gerudo Desert"],
      desc: "This is Riju's own sand seal. It may look intense, but she dotes on it regularly; the ribbon it wears was a gift form her, and it even has its own pen in Gerudo Town. It's far more agile than any other sand seal and far more outgoing. An ever-reliable partner to Riju, Patricia is always ready to take off through the desert at a moment's notice."
    },
    {
      no: "009",
      name: "BUSHY-TAILED SQUIRREL",
      cn: "蓬尾松鼠",
      img: "bushy-tailed_squirrel.png",
      got: true,
      meta: ["栖息地", "Hyrule Field"],
      desc: "These small creatures are known for their large tails. They tend to live in forests and subsist on acorns and other nuts. They carry their food in their mouths but will sometimes drop it when surprised in an adorable display of shock."
    },
    {
      no: "010",
      name: "WOODLAND BOAR",
      cn: "森林野猪",
      img: "woodland_boar.png",
      got: true,
      meta: ["栖息地", "Hyrule Field"],
      desc: "These medium-sized beasts can be found all throughout Hyrule. you can most often find them foraging for food in forests or meadows. Although usually docile, they won't hesitate to charge you full force if you get too close."
    },
    {
      no: "011",
      name: "RED-TUSKED BOAR",
      cn: "红牙野猪",
      img: "red-tusked_boar.png",
      got: true,
      meta: ["栖息地", "Akkala Highlands"],
      desc: "These boars are known for their red tusks and black fur. They're similar to your average boars but are considerably stronger. Extra caution is advised when hunting these."
    },
    {
      no: "012",
      name: "MOUNTAIN GOAT",
      cn: "山地山羊",
      img: "mountain_goat.png",
      got: true,
      meta: ["栖息地", "Hyrule Ridge"],
      desc: "These herbivores make their home in meadows and rocky areas. Their characteristically strong legs and hooves facilitate easy climbing over rocks. Goats aren't very quick, so they make good targets for beginning hunters."
    },
    {
      no: "013",
      name: "WHITE GOAT",
      cn: "白山羊",
      img: "white_goat.png",
      got: true,
      meta: ["栖息地", "West Necluda"],
      desc: "These goats are raised for their multiple uses. Their milk can be drank or made into butter, and their soft fur is used to make clothes. Domesticated goats wear bells around their necks so they can easily be found after being let out to graze."
    },
    {
      no: "014",
      name: "MOUNTAIN BUCK",
      cn: "山地鹿(雄)",
      img: "mountain_buck.png",
      got: true,
      meta: ["栖息地", "Hyrule Field"],
      desc: "These male deer are usually found deep in the forest. They're well known for their huge, branching antlers, which they'll swing in self-defense if threatened. Deer are cautious by nature so it can be tricky getting close, but if you can capture one, you may be able to take it for a ride."
    },
    {
      no: "015",
      name: "MOUNTAIN DOE",
      cn: "山地鹿(雌)",
      img: "mountain_doe.png",
      got: true,
      meta: ["栖息地", "Hyrule Field"],
      desc: "These female deer are often found alongside a male. They're very timid animals by nature, but they tend to let their guard down when eating apples, a favorite food. This tidbit of information can be useful to hunters."
    },
    {
      no: "016",
      name: "WATER BUFFALO",
      cn: "水牛",
      img: "water_buffalo.png",
      got: true,
      meta: ["栖息地", "Lanayru Wetlands"],
      desc: "These wild cows come equipped with big, strong horns. They live off grass that grows near the waterfront. Their meat is considered to be high quality, so they're a common target among hunters. Fun Fact: the domesticated Hateno cow, often raised in villages, was bred through selective breeding using these."
    },
    {
      no: "017",
      name: "HATENO COW",
      cn: "哈特诺奶牛",
      img: "hateno_cow.png",
      got: true,
      meta: ["栖息地", "East Necluda"],
      desc: "Originating in Hateno Village, these cows are kept as livestock primarily for their milk. Their horns are smaller than a water buffalo's, and they're much more docile and therefore easier to raise. Their horns are decorated with bright colors when taken out to pasture."
    },
    {
      no: "018",
      name: "HIGHLAND SHEEP",
      cn: "高地绵羊",
      img: "highland_sheep.png",
      got: true,
      meta: ["栖息地", "East Necluda"],
      desc: "Originally native to the mountainous regions, these sheep were domesticated for their wool and have since found a home in villages. Once the fluffy wool grows out, it's harvested and used to make clothing and bedding. They're calm, timid creatures and move about in small herds."
    },
    {
      no: "019",
      name: "GRASSLAND FOX",
      cn: "草原狐",
      img: "grassland_fox.png",
      got: true,
      meta: ["栖息地", "Hyrule Field"],
      desc: "This breed of fox is common to grasslands and forests and is hallmarked by its fluffy, white-tipped tail. Unlike other foxes, they tend to act independently rather than form packs. Being omnivores, they hunt animals smaller than themselves and often stick to eating fruit and insects."
    },
    {
      no: "020",
      name: "SNOWCOAT FOX",
      cn: "雪地狐",
      img: "snowcoat_fox.png",
      got: true,
      meta: ["栖息地", "Hebra Mountains"],
      desc: "This particular breed of grassland fox makes its home in cold climates such as the Tabantha region. Its fur turned white as a means of adapting to snowy weather, serving as natural camouflage. Because of this, spotting one in the snow takes a keen eye."
    },
    {
      no: "021",
      name: "MARAUDO WOLF",
      cn: "玛拉乌德狼",
      img: "maraudo_wolf.png",
      got: true,
      meta: ["栖息地", "Tabantha Frontier"],
      desc: "These wolves are not only carnivorous but can also be downright fierce. They're highly aggressive and aren't afraid to attack people. They hunt in groups and surround their prey as a means of bringing it down. That said, if one of their own is injured, the rest are wise enough to run away. They communicate via howls, so if you're wandering the forest and hear their call, you had best take care."
    },
    {
      no: "022",
      name: "WASTELAND COYOTE",
      cn: "荒地郊狼",
      img: "wasteland_coyote.png",
      got: true,
      meta: ["栖息地", "Gerudo Desert"],
      desc: "This contentious beast is native to the Gerudo region. It makes its home in the desert, so it doesn't have a problem with hot, arid climates. They do hunt other beasts and small animals but more often turn their sights on people. They're a threat to anyone traveling through the desert."
    },
    {
      no: "023",
      name: "COLD-FOOTED WOLF",
      cn: "冷足狼",
      img: "cold-footed_wolf.png",
      got: true,
      meta: ["栖息地", "Hebra Mountains"],
      desc: "This breed of maraudo wolf lives in snowy, mountainous areas, such as the Hebra Mountains. They travel in packs similar to their maraudo relatives but are considerably tougher thanks to having adapted to their harsh environment. They're made even more dangerous by their white fur, which provides a natural camouflage in the snow."
    },
    {
      no: "024",
      name: "TABANTHA MOOSE",
      cn: "塔班萨麋鹿",
      img: "tabantha_moose.png",
      got: true,
      meta: ["栖息地", "Hebra Mountains"],
      desc: "The largest breed of deer in Hyrule, this mammal's origin was traced back to the Tabantha region. It's easily distinguished by its immense antlers, which these moose shed and regrow yearly. Their meat is tender and high quality, so it works well in a stew."
    },
    {
      no: "025",
      name: "GREAT-HORNED RHINOCEROS",
      cn: "大角犀牛",
      img: "great-horned_rhinoceros.png",
      got: true,
      meta: ["栖息地", "Hebra Mountains"],
      desc: "This animal's horn is a whopping half the size of its body. Although originally members of arid-region rhinoceroses, these migrated to colder climates and adapted to live in snowy mountains. Their hides are particularly thick, and their horns can cause some serious damage, so only experienced hunters should track these."
    },
    {
      no: "026",
      name: "HONEYVORE BEAR",
      cn: "食蜜熊",
      img: "honeyvore_bear.png",
      got: true,
      meta: ["栖息地", "Tabantha Frontier"],
      desc: "This king among animals is dangerous game for even the most seasoned hunters. They'll attack anyone who wanders into their territory regardless of the wanderer's weaponry. As their name implies, they have a natural love of honey. Extreme caution is advised when you spot one, but if you're sneaky enough and maybe just a little bit crazy... you just may be able to ride one."
    },
    {
      no: "027",
      name: "GRIZZLEMAW BEAR",
      cn: "灰颚熊",
      img: "grizzlemaw_bear.png",
      got: true,
      meta: ["栖息地", "Hebra Mountains"],
      desc: "This breed of honeyvore bear is distinguished by its gray fur. Even more ferocious than their relatives, they're commonly believed to be the most dangerous wild animal. They live in deep snow away from villages, so it's uncommon to encounter one. That said, if you do find one, you'd be better off not picking a fight with it."
    },
    {
      no: "028",
      name: "HYLIAN RETRIEVER",
      cn: "海利亚寻回犬",
      img: "hylian_retriever.png",
      got: true,
      meta: ["栖息地", "Akkala Highlands"],
      desc: "The native breed of this mammal varies by region, but on thing remains true: this animals has been known as \"man's best friend\" since ancient times. They're very clever and obedient, so aside from serving as pets, they are also put to work watching over grazing livestock. It's said that all Hylian retrievers are descendants of the dog once owned by the king of Hyrule."
    },
    {
      no: "029",
      name: "BLUPEE",
      cn: "蓝皮",
      img: "blupee.png",
      got: true,
      meta: ["栖息地", "Satori Mountain"],
      desc: "They may look like mere rabbits at a fleeting glance, but these strange and aptly named creatures glow with a mysterious blue light. While the details of their origins are entirely unknown, there is one thing we do know: these peculiar little things have a penchant for collecting rupees."
    },
    {
      no: "030",
      name: "COMMON SPARROW",
      cn: "普通麻雀",
      img: "common_sparrow.png",
      got: true,
      meta: ["栖息地", "Hyrule Field"],
      desc: "As the name suggests, these birds are rather common around Hyrule. They mainly live in the plains or forests but sometimes venture out to villages. Their diet consists of nuts and small insects. They look pretty cute when they jump around, but they don't have much love for people."
    },
    {
      no: "031",
      name: "RED SPARROW",
      cn: "红雀",
      img: "red_sparrow.png",
      got: true,
      meta: ["栖息地", "Hebra Mountains"],
      desc: "These small birds live in the Hebra region and eat mainly nuts and wild plants. Their bright-red feathers are often used as decorations."
    },
    {
      no: "032",
      name: "BLUE SPARROW",
      cn: "蓝雀",
      img: "blue_sparrow.png",
      got: true,
      meta: ["栖息地", "Lanayru Great Spring"],
      desc: "This breed of sparrow is most often seen in the Lanayru region. They get most of their food from leaves and plants that grow near water. If it's safe enough, they can be spotted bathing in puddles or shallow rivers."
    },
    {
      no: "033",
      name: "RAINBOW SPARROW",
      cn: "七彩麻雀",
      img: "rainbow_sparrow.png",
      got: true,
      meta: ["栖息地", "Faron Grasslands"],
      desc: "These small birds hail from the Faron region. As the name suggests, their feathers are more colorful than other sparrows', which has made them a favorite among dilettantes. They feed on small rain-forest insects, but the omnivore in them loves nuts as well."
    },
    {
      no: "034",
      name: "SAND SPARROW",
      cn: "沙雀",
      img: "sand_sparrow.png",
      got: true,
      meta: ["栖息地", "Gerudo Desert"],
      desc: "This desert-dwelling breed of sparrow has adapted to withstand the heat in the arid climate of the Gerudo region. Sometimes they can be spotted half-buried in the sand, holding perfectly still as a means of evading predators."
    },
    {
      no: "035",
      name: "GOLDEN SPARROW",
      cn: "黄金麻雀",
      img: "golden_sparrow.png",
      got: true,
      meta: ["栖息地", "Great Hyrule Forest"],
      desc: "This breed of sparrow is native to the Eldin region. Their down is resistant to burning, an evolutionary trait produced by the harsh volcanic environment. They subsist on small insects that hide inside rocks."
    },
    {
      no: "036",
      name: "WOOD PIGEON",
      cn: "林鸽",
      img: "wood_pigeon.png",
      got: true,
      meta: ["栖息地", "Great Hyrule Forest"],
      desc: "These pigeons inhabit vast regions all throughout Hyrule, so they can often be found in forests, grasslands, or even villages. They don't have a very strong sense of awareness, so even less-skilled hunters can nab them pretty easily."
    },
    {
      no: "037",
      name: "RAINBOW PIGEON",
      cn: "七彩鸽",
      img: "rainbow_pigeon.png",
      got: true,
      meta: ["栖息地", "Hyrule Ridge"],
      desc: "This breed of pigeon is well known for its vivid feathers. They live mainly in the northern forests and grasslands of Hyrule. They're most fond of nuts and grain but won't pass up the occasional insect or earthworm if offered. Their meat is of a higher quality than typical wood pigeon's."
    },
    {
      no: "038",
      name: "HOTFEATHER PIGEON",
      cn: "暖羽鸽",
      img: "hotfeather_pigeon.png",
      got: true,
      meta: ["栖息地", "Eldin Canyon"],
      desc: "This rare breed of pigeon lives near Death Mountain. Their fireproof feathers are valuable as clothing material. Their meat, on the other hand, is not fireproof, and it'll burn up as soon as it's struck."
    },
    {
      no: "039",
      name: "WHITE PIGEON",
      cn: "白鸽",
      img: "white_pigeon.png",
      got: true,
      meta: ["栖息地", "Hebra Mountains"],
      desc: "This white-feathered breed of pigeon lives in the Hebra region. It's said that a wood pigeon survived atop a snowy mountain by changing its colors to blend in with the snow and soon after became a white pigeon. They have an extra layer of fat to guard against the cold, so they have been known to yield high-quality meat."
    },
    {
      no: "040",
      name: "MOUNTAIN CROW",
      cn: "山鸦",
      img: "mountain_crow.png",
      got: true,
      meta: ["栖息地", "Hyrule Ridge"],
      desc: "This bird is known for its cleverness and for its distinct claws. They make their homes in the mountains, forests, and villages alike. Not only are their jet-black feathers seen as an ill omen, but they'll steal crops right out of a farmer's hands if given the chance. Because of this, they're often met with enmity."
    },
    {
      no: "041",
      name: "BRIGHT-CHESTED DUCK",
      cn: "亮胸鸭",
      img: "bright-chested_duck.png",
      got: true,
      meta: ["栖息地", "Hyrule Ridge"],
      desc: "These birds can be found on waterfronts all over Hyrule. Their webbed feet make them excellent swimmers, and their long necks allow them to duck their heads underwater to find food. Their fatty meat is high quality."
    },
    {
      no: "042",
      name: "BLUE-WINGED HERON",
      cn: "蓝翼鹭",
      img: "blue-winged_heron.png",
      got: true,
      meta: ["栖息地", "Hyrule Ridge"],
      desc: "These birds live on waterfronts all throughout Hyrule. Their characteristically thin legs and long necks help them catch water-dwelling fish or frogs for food. They lie perfectly still in wait for their prey and then stretch out their long necks to capture their meal."
    },
    {
      no: "043",
      name: "PINK HERON",
      cn: "粉鹭",
      img: "pink_heron.png",
      got: true,
      meta: ["栖息地", "Hyrule Ridge"],
      desc: "This breed of Heron is characterized by the pink tips of its feathers. Unlike its waterfront-dwelling relative the blue-winged heron, these live in grasslands or arid regions and subsist on insects that live in the grass. They can often be found walking about searching for food but will fly away if they sense danger."
    },
    {
      no: "044",
      name: "ISLANDER HAWK",
      cn: "岛鹰",
      img: "islander_hawk.png",
      got: true,
      meta: ["栖息地", "Hyrule Field"],
      desc: "These carnivorous birds live in plains or highlands. They use their sharp talons and beaks to catch and eat small animals and other birds. They soar calmly through the sky and search for prey from above."
    },
    {
      no: "045",
      name: "SEAGULL",
      cn: "海鸥",
      img: "seagull.png",
      got: true,
      meta: ["栖息地", "Necluda Sea"],
      desc: "These birds live near the ocean. They eat mainly fish, so a flock of seagulls hovering over water is a good indication of where there are fish. Fisherman use this to their advantage when searching for a catch of their own."
    },
    {
      no: "046",
      name: "ELDIN OSTRICH",
      cn: "奥尔丁鸵鸟",
      img: "eldin_ostrich.png",
      got: true,
      meta: ["栖息地", "Eldin Canyon"],
      desc: "This large bird makes its home in the volcanic region of Eldin. Their heat-resistant feathers and skin are evolutionary traits produced by the harsh environment. Their wings are too small to facilitate flight, but their long legs make them pretty speedy runners."
    },
    {
      no: "047",
      name: "CUCCO",
      cn: "库丘鸟",
      img: "cucco.png",
      got: true,
      meta: ["栖息地", "West Necluda"],
      desc: "Villages often raise these birds for their eggs, but some people actually keep them as pets. They can't fly, but can flap their wings mighty furiously if picked up. They're usually calm creatures, but if you're persistent in your torment of them... Well..."
    },
    {
      no: "048",
      name: "HYRULE BASS",
      cn: "海拉鲁鲈鱼",
      img: "hyrule_bass.png",
      got: true,
      meta: ["栖息地", "Hyrule Field"],
      desc: "An ordinary fish that can be found all over Hyrule. It can be eaten raw, but cooking it amplifies its healing benefits."
    },
    {
      no: "049",
      name: "HEARTY BASS",
      cn: "精力鲈鱼",
      img: "hearty_bass.png",
      got: true,
      meta: ["栖息地", "West Necluda"],
      desc: "This large fish lives near the shoreline. Its sizable body can store a lot of nutrients. When cooked into a dish, it will temporarily increase your maximum hearts."
    },
    {
      no: "050",
      name: "STAMINOKA BASS",
      cn: "耐力鲈鱼",
      img: "staminoka_bass.png",
      got: true,
      meta: ["栖息地", "Hyrule Field"],
      desc: "This Hyrule bass got to be the biggest fish by never getting caught (until now). Its long life results in a cooked dish that will restore a lot of stamina."
    },
    {
      no: "051",
      name: "HEARTY SALMON",
      cn: "精力鲑鱼",
      img: "hearty_salmon.png",
      got: true,
      meta: ["栖息地", "Tabantha Frontier"],
      desc: "This fish makes its home in cold water, giving it extra layers of fat. It temporarily increases your maximum hearts when used in cooking."
    },
    {
      no: "052",
      name: "CHILLFIN TROUT",
      cn: "冷鳍鳟鱼",
      img: "chillfin_trout.png",
      got: true,
      meta: ["栖息地", "Tabantha Frontier"],
      desc: "This blue trout prefers cold bodies of water. Its skin contains enzymes that keep its body cool, and when cooked into a dish, it will temporarily boost your heat resistance."
    },
    {
      no: "053",
      name: "SIZZLEFIN TROUT",
      cn: "热鳍鳟鱼",
      img: "sizzlefin_trout.png",
      got: true,
      meta: ["栖息地", "Eldin Canyon"],
      desc: "This red trout prefers warm bodies of water. It has a special organ specifically for storing heat. When cooked into a dish, it will temporarily increase your resistance to the cold."
    },
    {
      no: "054",
      name: "VOLTFIN TROUT",
      cn: "电鳍鳟鱼",
      img: "voltfin_trout.png",
      got: true,
      meta: ["栖息地", "Tabantha Frontier"],
      desc: "This trout makes its home in the freshwater lakes. Its scales have an insulating compound that, when cooked into a dish, offers resistance to electricity."
    },
    {
      no: "055",
      name: "STEALTHFIN TROUT",
      cn: "潜鳍鳟鱼",
      img: "stealthfin_trout.png",
      got: true,
      meta: ["栖息地", "Great Hyrule Forest"],
      desc: "Consuming the bioluminescent compound that makes this fish glow in the dark will increase concentration. Dishes cooked with it will suppress noise when consumed."
    },
    {
      no: "056",
      name: "MIGHTY CARP",
      cn: "强壮鲤鱼",
      img: "mighty_carp.png",
      got: true,
      meta: ["栖息地", "Akkala Highlands"],
      desc: "This freshwater fish lives alongside its less mighty carp ilk. A compound in its liver promotes muscle growth. Dishes cooked with it will temporarily increase your attack power."
    },
    {
      no: "057",
      name: "ARMORED CARP",
      cn: "盔甲鲤鱼",
      img: "armored_carp.png",
      got: true,
      meta: ["栖息地", "Lanayru Great Spring"],
      desc: "Calcium deposits in the scales of this ancient fish make them as hard as armor. Cooking it into a dish will fortify your bones, temporarily increasing your defense."
    },
    {
      no: "058",
      name: "SANKE CARP",
      cn: "三色鲤",
      img: "sanke_carp.png",
      got: true,
      meta: ["栖息地", "West Necluda"],
      desc: "This wild armored carp has been bred into a prizewinning fish. Its beautifully colored markings do not occur in nature. It offers no special effects when cooked."
    },
    {
      no: "059",
      name: "MIGHTY PORGY",
      cn: "强壮鲷鱼",
      img: "mighty_porgy.png",
      got: true,
      meta: ["栖息地", "Necluda Sea"],
      desc: "This ocean-dwelling fish comes with one rude attitude. The compounds in its flesh elevate your competitive spirit when it's cooked into a dish, thus increasing your attack power."
    },
    {
      no: "060",
      name: "ARMORED PORGY",
      cn: "盔甲鲷鱼",
      img: "armored_porgy.png",
      got: true,
      meta: ["栖息地", "Necluda Sea"],
      desc: "This porgy's body is covered in armor-hard scales. The compounds in its scales, when cooked into a dish, fortify your bones and temporarily boost your defense."
    },
    {
      no: "061",
      name: "SNEAKY RIVER SNAIL",
      cn: "隐秘河螺",
      img: "sneaky_river_snail.png",
      got: true,
      meta: ["栖息地", "West Necluda"],
      desc: "This large, glow-in-the-dark snail lives in fresh water. When cooked into a dish, it heightens your senses so you can move about silently."
    },
    {
      no: "062",
      name: "HEARTY BLUESHELL SNAIL",
      cn: "精力蓝壳蜗牛",
      img: "hearty_blueshell_snail.png",
      got: true,
      meta: ["栖息地", "Lanayru Sea"],
      desc: "This snail lives on sandy beaches in large numbers. Its flesh contains a high amount of stimulants, so when cooked into a dish, it temporarily increases your maximum hearts."
    },
    {
      no: "063",
      name: "RAZORCLAW CRAB",
      cn: "利爪蟹",
      img: "razorclaw_crab.png",
      got: true,
      meta: ["栖息地", "Necluda Sea"],
      desc: "This crab is well known for its exceptionally sharp pincers. When cooked, the strength compound in its claws will increase your attack power."
    },
    {
      no: "064",
      name: "IRONSHELL CRAB",
      cn: "铁壳蟹",
      img: "ironshell_crab.png",
      got: true,
      meta: ["栖息地", "Necluda Sea"],
      desc: "This crab's shell is particularly hard. When cooked into dish, its fat and meat bolster the body to increase your defense."
    },
    {
      no: "065",
      name: "BRIGHT-EYED CRAB",
      cn: "亮眼蟹",
      img: "bright-eyed_crab.png",
      got: true,
      meta: ["栖息地", "Lanayru Great Spring"],
      desc: "This crab appears in large numbers when it rains. Once bite of its delectable meat, and you'll forget all your exhaustion. Replenishes your stamina when cooked into a dish."
    },
    {
      no: "066",
      name: "FAIRY",
      cn: "妖精",
      img: "fairy.png",
      got: true,
      meta: ["栖息地", "Greater Hyrule"],
      desc: "This fairy will fly from your pouch and heal all your wounds the moment you lose your last heart. It's easily mistaken for a firefly at first, but it glows in the daylight as well as night."
    },
    {
      no: "067",
      name: "WINTERWING BUTTERFLY",
      cn: "冬翅蝶",
      img: "winterwing_butterfly.png",
      got: true,
      meta: ["栖息地", "Hyrule Ridge"],
      desc: "The powdery scales of this butterfly's wings cool the air around it. Watching it flutter around snowflakes is a thing of beauty. Cook it with monster parts for a heat-resistant elixir."
    },
    {
      no: "068",
      name: "SUMMERWING BUTTERFLY",
      cn: "夏翅蝶",
      img: "summerwing_butterfly.png",
      got: true,
      meta: ["栖息地", "Great Hyrule Forest"],
      desc: "A butterfly found in the woods and plains of warm regions. Its wings absorb the warmth of the sun. Cook it with monster parts to create an elixir that makes you feel warm and fuzzy."
    },
    {
      no: "069",
      name: "THUNDERWING BUTTERFLY",
      cn: "雷翅蝶",
      img: "thunderwing_butterfly.png",
      got: true,
      meta: ["栖息地", "Hyrule Ridge"],
      desc: "This rare butterfly only shows itself when it rains. The organs in its body produce an insulating compound. When made into an elixir, it offers electrical resistance."
    },
    {
      no: "070",
      name: "SMOTHERWING BUTTERFLY",
      cn: "焖翅蝶",
      img: "smotherwing_butterfly.png",
      got: true,
      meta: ["栖息地", "Eldin Canyon"],
      desc: "A butterfly found in the woods and plains of warm regions. Its wings absorb the warmth of the sun. Cook it with monster parts to create an elixir that makes you feel warm and fuzzy."
    },
    {
      no: "071",
      name: "COLD DARNER",
      cn: "寒蜻蜓",
      img: "cold_darner.png",
      got: true,
      meta: ["栖息地", "Tabantha Frontier"],
      desc: "This dragonfly prefers the cool shade of trees to the warmth of the sun. Its wings disperse heat from its body, which can be cooked into a heat-resistance elixir."
    },
    {
      no: "072",
      name: "WARM DARNER",
      cn: "暖蜻蜓",
      img: "warm_darner.png",
      got: true,
      meta: ["栖息地", "Akkala Highlands"],
      desc: "This dragonfly has a special organ that causes it to sweat profusely. Cook it with monster parts for an elixir that will raise your core temperature so you can resist the cold."
    },
    {
      no: "073",
      name: "ELECTRIC DARNER",
      cn: "电蜻蜓",
      img: "electric_darner.png",
      got: true,
      meta: ["栖息地", "Hyrule Ridge"],
      desc: "This rare dragonfly only appears in the rain. Its wings direct electricity away from its body. Cook it with monster parts for an electricity-resistance elixir."
    },
    {
      no: "074",
      name: "RESTLESS CRICKET",
      cn: "躁动蟋蟀",
      img: "restless_cricket.png",
      got: true,
      meta: ["栖息地", "Hyrule Field"],
      desc: "A very energetic cricket. Cook it with monster parts to create a stamina-recovery elixir."
    },
    {
      no: "075",
      name: "BLADED RHINO BEETLE",
      cn: "刀角犀金龟",
      img: "bladed_rhino_beetle.png",
      got: true,
      meta: ["栖息地", "West Necluda"],
      desc: "This beetle's razor-sharp horns demand that you handle it with care. Boil the horns alongside monster parts to concoct an elixir that will raise your attack power."
    },
    {
      no: "076",
      name: "RUGGED RHINO BEETLE",
      cn: "粗犷犀金龟",
      img: "rugged_rhino_beetle.png",
      got: true,
      meta: ["栖息地", "Hyrule Field"],
      desc: "This beetle's hard body resembles armor. When the shell is cooked with monster parts, the resulting elixir boosts your defense."
    },
    {
      no: "077",
      name: "ENERGETIC RHINO BEETLE",
      cn: "活力犀金龟",
      img: "energetic_rhino_beetle.png",
      got: true,
      meta: ["栖息地", "Akkala Highlands"],
      desc: "This valuable beetle can live up to ten years. When cooked with monster parts, its impressive vitality translates into an elixir that will greatly restore your stamina."
    },
    {
      no: "078",
      name: "SUNSET FIREFLY",
      cn: "黄昏萤火虫",
      img: "sunset_firefly.png",
      got: true,
      meta: ["栖息地", "West Necluda"],
      desc: "These fireflies glow gently in the dark. When cooked with monster parts, the compound that causes it to glow results in an elixir that will allow you to move more quietly."
    },
    {
      no: "079",
      name: "HOT-FOOTED FROG",
      cn: "热足蛙",
      img: "hot-footed_frog.png",
      got: true,
      meta: ["栖息地", "Lanayru Great Spring"],
      desc: "A quick frog that can be found hopping around near water. Cook it with monster parts to draw out its speed-boost effect."
    },
    {
      no: "080",
      name: "TIRELESS FROG",
      cn: "不知疲倦的蛙",
      img: "tireless_frog.png",
      got: true,
      meta: ["栖息地", "Lanayru Great Spring"],
      desc: "This rare frog only ventures out in the rain. When cooked with monster parts, the elixir it produces will temporarily increase your maximum stamina."
    },
    {
      no: "081",
      name: "HIGHTAIL LIZARD",
      cn: "高尾蜥蜴",
      img: "hightail_lizard.png",
      got: true,
      meta: ["栖息地", "West Necluda"],
      desc: "A lizard found throughout Hyrule. It's a but slow to react at times, but it given a chance to escape, it will dart off quickly. Cook it with monster parts for a speed-boosting elixir."
    },
    {
      no: "082",
      name: "HEARTY LIZARD",
      cn: "精力蜥蜴",
      img: "hearty_lizard.png",
      got: true,
      meta: ["栖息地", "Gerudo Desert"],
      desc: "This rare lizard lives deep in the forests. It feeds on high-nutrient foods, giving it great vitality. When used to make elixirs, they temporarily increase your maximum hearts."
    },
    {
      no: "083",
      name: "FIREPROOF LIZARD",
      cn: "耐火蜥蜴",
      img: "fireproof_lizard.png",
      got: true,
      meta: ["栖息地", "Eldin Canyon"],
      desc: "This rare lizard can only be found in the Eldin region. Its scales have heat-resistant properties, so when cooked with monster parts it produces a heat-resistance elixir."
    }
  ],
  monsters: [
    {
      no: "084",
      name: "CHUCHU",
      cn: "丘丘",
      img: "chuchu.png",
      got: true,
      meta: ["出没", "Hyrule Field"],
      desc: "This low-level, gel-based monster can be found all over Hyrule. It tends to spring its attacks on unsuspecting prey from the ground or from trees. Its strength varies by size, and the type of jelly it drops varies depending on whether the Chuchu was heated up, cooled down, or shocked."
    },
    {
      no: "085",
      name: "FIRE CHUCHU",
      cn: "火丘丘",
      img: "fire_chuchu.png",
      got: true,
      meta: ["出没", "Eldin Canyon"],
      desc: "This low-level gel monster is engulfed in flames. Its strength varies depending on its size. It tends to explode if attacked from close range, so the use of spears, arrows, and other ranged weapons is advised."
    },
    {
      no: "086",
      name: "ICE CHUCHU",
      cn: "冰丘丘",
      img: "ice_chuchu.png",
      got: true,
      meta: ["出没", "Gerudo Highlands"],
      desc: "This low-level gel monster is engulfed in freezing-cold air. Its strength varies depending on its size. It tends to explode if attacked from close range, so the use of spears, arrows, and other ranged weapons is advised."
    },
    {
      no: "087",
      name: "ELECTRIC CHUCHU",
      cn: "电丘丘",
      img: "electric_chuchu.png",
      got: true,
      meta: ["出没", "Gerudo Highlands"],
      desc: "This low-level gel monster is engulfed in electricity. Its strength varies depending on its size. It tends to explode if attacked from close range, so the use of spears, arrows, and other ranged weapons is advised."
    },
    {
      no: "088",
      name: "KEESE",
      cn: "奇斯",
      img: "keese.png",
      got: true,
      meta: ["出没", "Hyrule Field"],
      desc: "The unpredictable flight pattern of this noctoural bat-like species can make fighting them a nuisance, but they're weak enough to fell with a single strike. Sometimes they'll attack in packs, but even then, a pack can be sent packing with a single attack."
    },
    {
      no: "089",
      name: "FIRE KEESE",
      cn: "火奇斯",
      img: "fire_keese.png",
      got: true,
      meta: ["出没", "Eldin Canyon"],
      desc: "The fire that engulfs the bodies of these bat-like Keese makes them more dangerous than the standard type. They're capable of setting fire to anything they touch."
    },
    {
      no: "090",
      name: "ICE KEESE",
      cn: "冰奇斯",
      img: "ice_keese.png",
      got: true,
      meta: ["出没", "Hebra Mountains"],
      desc: "The intense frost that engulfs the bodies of these bat-like Keese makes them more dangerous than the standard type. They're capable of freezing anything they touch."
    },
    {
      no: "091",
      name: "ELECTRIC KEESE",
      cn: "电奇斯",
      img: "electric_keese.png",
      got: true,
      meta: ["出没", "Lanayru Great Spring"],
      desc: "The electricity that engulfs the bodies of these bat-like Keese makes them more dangerous than the standard type. They're capable of shocking anything they touch."
    },
    {
      no: "092",
      name: "WATER OCTOROK",
      cn: "水八爪怪",
      img: "water_octorok.png",
      got: true,
      meta: ["出没", "West Necluda"],
      desc: "Although they spend most of their time in water, the drop in barometric pressure that occurs when it rains causes an air sac within these octopus-like monsters to inflate and lift them into the air. The rocks they spit out can be bounced back with a shield."
    },
    {
      no: "093",
      name: "FOREST OCTOROK",
      cn: "森林八爪怪",
      img: "forest_octorok.png",
      got: true,
      meta: ["出没", "Hyrule Ridge"],
      desc: "Although originally an aquatic species, this type has adapted to life in the forest. They hide among the trees, disguising themselves as grass or unassuming shrubbery, and then attack when someone wanders by."
    },
    {
      no: "094",
      name: "ROCK OCTOROK",
      cn: "岩八爪怪",
      img: "rock_octorok.png",
      got: true,
      meta: ["出没", "Eldin Canyon"],
      desc: "This octopus-like species of monster lives in volcanic regions. When they inhale, they're preparing to spit out flaming rocks but have been known to suck up weapons or bombs in the same breath."
    },
    {
      no: "095",
      name: "SNOW OCTOROK",
      cn: "雪八爪怪",
      img: "snow_octorok.png",
      got: true,
      meta: ["出没", "Gerudo Highlands"],
      desc: "These octopus-like monsters live in snowy fields and disguise themselves as grass. When someone wanders by, they spring into action and attack by spitting snowballs."
    },
    {
      no: "096",
      name: "TREASURE OCTOROK",
      cn: "宝藏八爪怪",
      img: "treasure_octorok.png",
      got: true,
      meta: ["出没", "Gerudo Highlands"],
      desc: "These particularly clever monsters bury themselves in deep sand or snow and disguise themselves as treasure chests. Anyone who approaches the chests is attacked. The treasures chests are not magnetic, which proves that they are actually a part of these monsters' bodies."
    },
    {
      no: "097",
      name: "FIRE WIZZROBE",
      cn: "火威兹罗",
      img: "fire_wizzrobe.png",
      got: true,
      meta: ["出没", "Hyrule Field"],
      desc: "These spell-casting monsters can be found all over Hyrule. They use their fire rods to hurl fireballs or to summon flaming monsters and have been known to severely raise the temperature around them. The weather will normalize once the Wizzrobe is defeated."
    },
    {
      no: "098",
      name: "ICE WIZZROBE",
      cn: "冰威兹罗",
      img: "ice_wizzrobe.png",
      got: true,
      meta: ["出没", "Gerudo Highlands"],
      desc: "These spell-casting monsters can be found all over Hyrule. They use their ice rods to create freezing blasts of air or to summon frozen monsters and have been known to cause blizzards to severely decrease the temperatures around them. The weather will normalize once the Wizzrobe is defeated."
    },
    {
      no: "099",
      name: "ELECTRIC WIZZROBE",
      cn: "电威兹罗",
      img: "electric_wizzrobe.png",
      got: true,
      meta: ["出没", "Hyrule Ridge"],
      desc: "These spell-casting monsters can be found all over Hyrule. They use their lightning rods to hurl balls of electricity or to summon monsters surging with electricity and have been known to cause thunderstorms in the area. The weather will normalize once the Wizzrobe has been defeated."
    },
    {
      no: "100",
      name: "METEO WIZZROBE",
      cn: "陨石威兹罗",
      img: "meteo_wizzrobe.png",
      got: true,
      meta: ["出没", "Hyrule Field"],
      desc: "These spell-casting monsters can be found all over Hyrule. They use their meteor rods to hurl fireballs or to summon flaming monsters and have been known to severely raise the temperature around them. The weather will normalize once the Wizzrobe is defeated."
    },
    {
      no: "101",
      name: "BLIZZROBE",
      cn: "暴雪威兹罗",
      img: "blizzrobe.png",
      got: true,
      meta: ["出没", "Hyrule Field"],
      desc: "These spell-casting monsters can be found all over Hyrule. They use their blizzard rods to create freezing blasts of air or to summon frozen monsters and have been known to cause blizzards to severely decrease the temperature around them. The weather will normalize once the Blizzrobe is defeated."
    },
    {
      no: "102",
      name: "THUNDER WIZZROBE",
      cn: "雷霆威兹罗",
      img: "thunder_wizzrobe.png",
      got: true,
      meta: ["出没", "Hyrule Field"],
      desc: "These spell-casting monsters can be found all over Hyrule. They use their thunderstorm rods to hurl balls of electricity or to summon monsters surging with electricity and have been known to cause thunderstorms in the area. The weather will normalize once the Wizzrobe is defeated."
    },
    {
      no: "103",
      name: "BOKOBLIN",
      cn: "波克布林",
      img: "bokoblin.png",
      got: true,
      meta: ["出没", "Hyrule Field"],
      desc: "This common species is a nuisance all over Hyrule. Some have unified in the time following the Great Calamity and have formed factions of bandits. While not very clever, they are at least intelligent enough to hunt beasts and grill their meat for food. Though they're typically ferocious carnivores, they actually enjoy fruit as well."
    },
    {
      no: "104",
      name: "BLUE BOKOBLIN",
      cn: "蓝色波克布林",
      img: "blue_bokoblin.png",
      got: true,
      meta: ["出没", "Gerudo Desert"],
      desc: "This common species is a nuisance all over Hyrule. They're tougher and have stronger weapons than the red Bokoblins - and are a little more clever, as well. At the very least, they have figured out that they can simply kick a Remote Bomb out of the way to avoid its blast."
    },
    {
      no: "105",
      name: "BLACK BOKOBLIN",
      cn: "黑色波克布林",
      img: "black_bokoblin.png",
      got: true,
      meta: ["出没", "Hyrule Field"],
      desc: "Although Bokoblins are generally a nuisance, the Black Bokoblins are among the most dangerous type. They're extremely resilient, and many are armed with more advanced weapons."
    },
    {
      no: "106",
      name: "STALKOBLIN",
      cn: "骷髅波克布林",
      img: "stalkoblin.png",
      got: true,
      meta: ["出没", "Hyrule Field"],
      desc: "The remains of Bokoblins appear in the dark of the night. While they're fragile enough to crumble from a single blow, as long as a skull remains intact, they'll continue to pull themselves back together and go on fighting. Sometimes the body will pick up the wrong skull, but this doesn't seem to be a problem..."
    },
    {
      no: "107",
      name: "SILVER BOKOBLIN",
      cn: "白银波克布林",
      img: "silver_bokoblin.png",
      got: true,
      desc: "You would be foolish to call these Silver Bokoblins a mere nuisance. They have been influenced by Ganon's fiendish magic, so they are stronger than even the Black Bokoblins. They're called \"silver\" not only because of their coloring but also to denote their rarity. The purple markings help them to stand out even more."
    },
    {
      no: "108",
      name: "MOBLIN",
      cn: "莫力布林",
      img: "moblin.png",
      got: true,
      meta: ["出没", "Hyrule Field"],
      desc: "This heavyweight species of monster can be found all over Hyrule. They're physically very strong, their legs along strong enough to resist the force of a bomb blast. They're much more dangerous than the Bokoblins. In fact, Moblins have been known to pick up Bokoblins and throw them as makeshift projectile weapons."
    },
    {
      no: "109",
      name: "BLUE MOBLIN",
      cn: "蓝色莫力布林",
      img: "blue_moblin.png",
      got: true,
      meta: ["出没", "Hyrule Field"],
      desc: "These heavyweight monsters can be found all over Hyrule. They're much tougher than their standard counterparts and often have much stronger weapons equipped."
    },
    {
      no: "110",
      name: "BLACK MOBLIN",
      cn: "黑色莫力布林",
      img: "black_moblin.png",
      got: true,
      meta: ["出没", "Hyrule Field"],
      desc: "These heavyweight monsters can be found all over Hyrule and are among the most dangerous types of Moblin. They're extremely resilient and are often armed with some of the strongest weapons Moblins can carry."
    },
    {
      no: "111",
      name: "STALMOBLIN",
      cn: "骷髅莫力布林",
      img: "stalmoblin.png",
      got: true,
      meta: ["出没", "Great Hyrule Forest"],
      desc: "The remains of Moblins appear in the dark of the night. Even the toughest Moblins become fragile when they're little more than a pile of bones, so they'll crumble after just a few attacks. However, as long as a skull remains intact, they'll continue to pull themselves back together and go on fighting."
    },
    {
      no: "112",
      name: "SILVER MOBLIN",
      cn: "白银莫力布林",
      img: "silver_moblin.png",
      got: true,
      desc: "The strongest of all Moblins, Ganon's fiendish magic has allowed them to surpass even the Black Moblins in strength and resilience. They're called \"silver\" for both their body color as well as their rarity. The purple patterns on their bodies also help them to stand out."
    },
    {
      no: "113",
      name: "LIZALFOS",
      cn: "蜥蜴战士",
      img: "lizalfos.png",
      got: true,
      meta: ["出没", "Lanayru Great Spring"],
      desc: "These quick-witted, lizard-like monsters can be found all over Hyrule. They're a sly species that lurks underwater or uses camouflage to blend in with the environment to launch ambushes. Moreover, they never sleep. They're meat eaters by nature but will enjoy the occasional insect or two."
    },
    {
      no: "114",
      name: "BLUE LIZALFOS",
      cn: "蓝色蜥蜴战士",
      img: "blue_lizalfos.png",
      got: true,
      meta: ["出没", "Tabantha Frontier"],
      desc: "These quick-witted, lizard-like monsters can be found all over Hyrule. Compared to the green Lizalfos, many of these carry much stronger weapons and are generally much tougher."
    },
    {
      no: "115",
      name: "BLACK LIZALFOS",
      cn: "黑色蜥蜴战士",
      img: "black_lizalfos.png",
      got: true,
      meta: ["出没", "Hyrule Field"],
      desc: "These quick-witted, lizard-like monsters can be found all over Hyrule. This particular type tends to carry some pretty strong weapons, so they are among the most dangerous Lizalfos."
    },
    {
      no: "116",
      name: "STALIZALFOS",
      cn: "骷髅蜥蜴战士",
      img: "stalizalfos.png",
      got: true,
      meta: ["出没", "Gerudo Desert"],
      desc: "The remains of Lizalfos appear in the dark of night. They're as sly as ever, even now that they're just some bones stacked atop each other. However, their bodies are much more fragile, and a single solid hit can reduce them to pieces. If a skull remains intact, they will pull themselves back up and continue to fight. They've been known to grab the wrong skull at times, but they never seem to mind..."
    },
    {
      no: "117",
      name: "FIRE-BREATH LIZALFOS",
      cn: "吐火蜥蜴战士",
      img: "fire-breath_lizalfos.png",
      got: true,
      meta: ["出没", "Eldin Canyon"],
      desc: "These quick-witted, lizard-like monsters can be found all over Hyrule. Their fiery breath makes them pretty dangerous, but exposure to cold will kill them instantly. They mainly make their homes in volcanic areas but have also been sighted in the Akkala region."
    },
    {
      no: "118",
      name: "ICE-BREATH LIZALFOS",
      cn: "吐冰蜥蜴战士",
      img: "ice-breath_lizalfos.png",
      got: true,
      meta: ["出没", "Gerudo Highlands"],
      desc: "These quick-witted, lizard-like monsters can be found all over Hyrule. The balls of ice they spit make them particularly troublesome, but exposure to fire will kill them instantly. Their homes are mainly on snowy mountains."
    },
    {
      no: "119",
      name: "ELECTRIC LIZALFOS",
      cn: "电蜥蜴战士",
      img: "electric_lizalfos.png",
      got: true,
      meta: ["出没", "Gerudo Desert"],
      desc: "These quick-witted, lizard-like monsters can be found all over Hyrule. The can emit strong electrical currents from their bodies, so don't get too close. Their horns are brimming with electricity, which will discharge and arc to nearby areas if struck by an arrow. They tend to live in desert climates."
    },
    {
      no: "120",
      name: "SILVER LIZALFOS",
      cn: "白银蜥蜴战士",
      img: "silver_lizalfos.png",
      got: true,
      desc: "These Lizalfos have been influenced by Ganon's fiendish magic to become the strongest Lizalfos of all. They're called \"silver\" for their unique coloring and also to denote their rarity. Their purple pattern makes them even more distinct."
    },
    {
      no: "121",
      name: "LYNEL",
      cn: "莱尼尔",
      img: "lynel.png",
      got: true,
      meta: ["出没", "Lanayru Great Spring"],
      desc: "These fearsome monsters have lived in Hyrule since ancient times. They possess intense intelligence, resilience, and strength, making them among the most dangerous monsters in all the land. This is compounded by the fact that they have a natural resistance to all elements. You would be wise to challenge a Lynel only if you're very well prepared."
    },
    {
      no: "122",
      name: "BLUE-MANED LYNEL",
      cn: "蓝鬃莱尼尔",
      img: "blue-maned_lynel.png",
      got: true,
      meta: ["出没", "Hyrule Field"],
      desc: "These fearsome monsters have lived in Hyrule since ancient times. Compared to the standard Lynel, those with blue manes much tougher and equipped with much stronger weapons. Facing off against a Lynel is ill-advised, but if you must, be sure you're well prepared."
    },
    {
      no: "123",
      name: "WHITE-MANED LYNEL",
      cn: "白鬃莱尼尔",
      img: "white-maned_lynel.png",
      got: true,
      meta: ["出没", "Hyrule Field"],
      desc: "These fearsome monsters have lived in Hyrule since ancient times. Their ability to breathe fire makes White-Maned Lynels among the toughest of the species; each one of their attacks is an invitation to the grave. There are so few eyewitness accounts of this breed because a White-Maned Lynel is not one to let even simple passersby escape with their lives."
    },
    {
      no: "124",
      name: "SILVER LYNEL",
      cn: "白银莱尼尔",
      img: "silver_lynel.png",
      got: true,
      desc: "Silver Lynels are not to be trifled with. They have been influenced by Ganon's fiendish magic, so they are the strongest among the Lynel species, surpassing even the strength of those with white manes. The term \"silver\" denotes not only their color but also their rarity. The purple stripes help them to stand out even more."
    },
    {
      no: "125",
      name: "GUARDIAN STALKER",
      cn: "守护者(步行型)",
      img: "guardian_stalker.png",
      got: true,
      meta: ["出没", "Hyrule Field"],
      desc: "The Sheikah of ancient Hyrule developed this as a weapon to combat Ganon. Its six legs give it extraordinary mobility compared to most current vehicles, and its powerful laser provides far greater offensive capability than conventional weaponry. Destroying the legs severely reduces its mobility."
    },
    {
      no: "126",
      name: "GUARDIAN SKYWATCHER",
      cn: "守护者(飞天型)",
      img: "guardian_skywatcher.png",
      got: true,
      meta: ["出没", "Hyrule Field"],
      desc: "The Sheikah of ancient Hyrule developed this as a weapon to combat Ganon. This flying model is an improvement over the walking type, capable of either attacking or surveying from the air. Destroying the propeller will ground it."
    },
    {
      no: "127",
      name: "GUARDIAN TURRET",
      cn: "守护者(炮台型)",
      img: "guardian_turret.png",
      got: true,
      meta: ["出没", "Hyrule Castle"],
      desc: "The Sheikah of ancient Hyrule developed this as a weapon to combat Ganon. This stationary model was used for defending important structures. Its offensive power is on par with other Guardians, and omitting the legs kept the manufacturing costs low."
    },
    {
      no: "128",
      name: "SENTRY",
      cn: "守护者哨兵",
      img: "sentry.png",
      got: true,
      meta: ["出没", "Death Mountain"],
      desc: "These sentries dispatched from Divine Beast Vah Rudania are equipped with searchlights that can spot intruders."
    },
    {
      no: "129",
      name: "DECAYED GUARDIAN",
      cn: "残破守护者",
      img: "decayed_guardian.png",
      got: true,
      meta: ["出没", "Hyrule Field"],
      desc: "The Sheikah of ancient Hyrule developed this as a weapon to combat Ganon, but it was destroyed during the Great Calamity. Ages of weather and neglect have left it in a state of disrepair. Approach with caution; some of the derelict models have been known to awaken from stasis and attack when approached."
    },
    {
      no: "130",
      name: "GUARDIAN SCOUT I",
      cn: "守护者侦察机 I",
      img: "guardian_scout_i.png",
      got: true,
      desc: "Guardians were originally designed by an ancient civilization to combat Ganon, but these smaller models were placed inside shrines as part of the trials found within. The multiple legs and beam functionality were scaled down but kept mostly intact."
    },
    {
      no: "131",
      name: "GUARDIAN SCOUT II",
      cn: "守护者侦察机 II",
      img: "guardian_scout_ii.png",
      got: true,
      desc: "Although originally designed by an ancient civilization to combat Ganon, these scaled-down Guardians were placed inside shrines as part of the trials. In additional to the beam functionality, this particular model was designed to handle weaponry as a means of further testing the combat prowess of one undertaking the trials. It takes some serious skill to go toe-to-toe with one of these."
    },
    {
      no: "132",
      name: "GUARDIAN SCOUT III",
      cn: "守护者侦察机 III",
      img: "guardian_scout_iii.png",
      got: true,
      desc: "Although originally designed by an ancient civilisation to combat Ganon, these scaled-down Guardians were placed inside shrines as part or the trials. This model is equipped with twin-blade functionality to further test the combat prowess of one undertaking the trials. It takes a nimble fighter to overcome this one."
    },
    {
      no: "133",
      name: "GUARDIAN SCOUT IV",
      cn: "守护者侦察机 IV",
      img: "guardian_scout_iv.png",
      got: true,
      desc: "An ancient civilization originally designed Guardians to combat Ganon but then scaled them down to place in shrines as part of the trials. This model is very resilient and has been outfitted with triple-blade functionality, allowing it to wield three weapons. This will put any would-be hero to the test for sure. A great deal of strength and confidence alike are required to contend with one of these."
    },
    {
      no: "134",
      name: "YIGA FOOTSOLDIER",
      cn: "依盖队小兵",
      img: "yiga_footsoldier.png",
      got: true,
      desc: "The lowest-ranked members of the Yiga Clan. They've been dispatched all across Hyrule with a single task: seek out Link and end his life. They're a crafty bunch, sometimes disguising themselves as simple travelers or villagers to get the jump on you. Be wary of suspicious people you encounter. They're very agile and carry a bow and one-handed sword."
    },
    {
      no: "135",
      name: "YIGA BLADEMASTER",
      cn: "依盖队刀手",
      img: "yiga_blademaster.png",
      got: true,
      desc: "These are the elite soldiers of the Yiga Clan. They favor the windcleaver blade and are extremely agile despite their bulky build. At this Yiga Clan rank, they have mastered a technique that allows them to manipulate the very earth. By striking the ground, they can create stone pillars and blasts of air."
    },
    {
      no: "136",
      name: "MASTER KOHGA",
      cn: "可盖大人",
      img: "master_kohga.png",
      got: true,
      meta: ["出没", "Yiga Clan Hideout"],
      desc: "The leader of the Yiga Clan, a group formed with just a single objective: eliminate Link. He sends his minions all over Hyrule in search of you but tends to spend most of his time napping and generally loafing about. Despite this, his mastery of the esoteric arts has earned him a deep respect. Even if he were to die, his followers would never give up on their one and only task."
    },
    {
      no: "137",
      name: "MONK MAZ KOSHIA",
      cn: "马兹·柯西亚大师",
      img: "monk_maz_koshia.png",
      got: true,
      desc: "The arbiter of worthiness for the hero who wishes to control a Divine Beast, following a revelation from the Goddess Hylia. As the last part of the final trial, the monk offers a challenge of ancient techniques."
    },
    {
      no: "138",
      name: "STONE TALUS",
      cn: "岩石巨人",
      img: "stone_talus.png",
      got: true,
      meta: ["出没", "West Necluda"],
      desc: "This enormous monster is naturally camouflaged as a rock formation. Neither sword nor arrow can pierce its stony form, but a cunning adventurer knows to scale its body and attack the ore sprouting from its peak."
    },
    {
      no: "139",
      name: "STONE TALUS (LUMINOUS)",
      cn: "岩石巨人(夜光)",
      img: "stone_talus_(luminous).png",
      got: true,
      meta: ["出没", "Gerudo Highlands"],
      desc: "This enormous monster is naturally camouflaged as a rock formation. Neither sword nor arrow can pierce its stony form, but a cunning adventurer knows to scale its body and attack the ore sprouting from its peak. Unlike your average Stone Talus, this type's ore deposit consists mostly of luminous stone."
    },
    {
      no: "140",
      name: "STONE TALUS (RARE)",
      cn: "岩石巨人(稀有)",
      img: "stone_talus_(rare).png",
      got: true,
      meta: ["出没", "Hyrule Field"],
      desc: "This enormous monster is naturally camouflaged as a rock formation. Neither stone nor arrow can pierce its stony form, but a cunning adventurer knows to scale its body and attack the ore sprouting from its peak. Unlike your average Stone Talus, this type's ore deposit contains a large amount of precious ore."
    },
    {
      no: "141",
      name: "IGNEO TALUS",
      cn: "熔岩巨人",
      img: "igneo_talus.png",
      got: true,
      meta: ["出没", "Eldin Canyon"],
      desc: "This enormous monster is naturally camouflaged as molten rock. Neither sword nor arrow can pierce its fiery form. Merely touching its magma-hot body can burn you pretty badly, but you may be able to scale it if you can use something to chill its flames."
    },
    {
      no: "142",
      name: "FROST TALUS",
      cn: "冰岩巨人",
      img: "frost_talus.png",
      got: true,
      meta: ["出没", "Hebra Mountains"],
      desc: "This enormous monster is naturally camouflaged as a frozen rock formation. Neither sword nor arrow can pierce its frigid form. Merely touching its frosty body can leave you with severe frostbite, but you may be able to scale it if you use something to thaw its icy exterior."
    },
    {
      no: "143",
      name: "STONE PEBBLIT",
      cn: "岩石小宝",
      img: "stone_pebblit.png",
      got: true,
      meta: ["出没", "Greater Hyrule"],
      desc: "A very young Stone Talus. Their bodies toughen as they mature, becoming as tough as boulders by adulthood. As a child, however, their bodies are light enough to be lifted and fragile enough to break when thrown."
    },
    {
      no: "144",
      name: "IGNEO PEBBLIT",
      cn: "熔岩小宝",
      img: "igneo_pebblit.png",
      got: true,
      meta: ["出没", "Eldin Canyon"],
      desc: "A very young Igneo Talus. Their bodies toughen as they mature and convert fully into lava by adulthood. As a child, however, while still covered in fire, their bodies are fragile and light enough to be blown away by a bomb's blast."
    },
    {
      no: "145",
      name: "FROST PEBBLIT",
      cn: "冰岩小宝",
      img: "frost_pebblit.png",
      got: true,
      meta: ["出没", "Hebra Mountains"],
      desc: "A very young Frost Talus. Their bodies toughen and frost over as they mature, becoming entirely made of ice by adulthood. As a child, however, their bodies are awfully fragile and are light enough to be blown away by a bomb's blast."
    },
    {
      no: "146",
      name: "IGNEO TALUS TITAN",
      cn: "熔岩巨神",
      img: "igneo_talus_titan.png",
      got: true,
      desc: "This monster is an Igneo Talus subspecies that is camouflaged as molten rock. It lives in lava for many years before emerging at an enormous size. It is wildly powerful and emits a tremendous amount of heat, causing a constant updraft in its vicinity. This monster is so fearsome it has earned the title of Titan."
    },
    {
      no: "147",
      name: "HINOX",
      cn: "西诺克斯",
      img: "hinox.png",
      got: true,
      meta: ["出没", "East Necluda"],
      desc: "The largest monster to make its home in Hyrule, the Hinox lives primarily in forested areas. A keen awareness of your surroundings is paramount when facing one, as Hinox are known for tearing entire trees from the ground and using them as weapons. A deft hand can steal weapons off the necklaces they wear."
    },
    {
      no: "148",
      name: "BLUE HINOX",
      cn: "蓝色西诺克斯",
      img: "blue_hinox.png",
      got: true,
      meta: ["出没", "Hyrule Field"],
      desc: "The largest monster to make its home in Hyrule, the Hinox lives primarily in forested areas. A keen awareness of your surroundings is paramount when facing one, as Hinox are known for tearing entire trees from the ground and using them as weapons. Blue Hinox wear greaves that can be burnt away to expose their feet. A deft hand can steal weapons off the necklaces they wear."
    },
    {
      no: "149",
      name: "BLACK HINOX",
      cn: "黑色西诺克斯",
      img: "black_hinox.png",
      got: true,
      meta: ["出没", "East Necluda"],
      desc: "The largest monster to make its home in Hyrule, the Hinox lives primarily in forested areas. A keen awareness of your surroundings is paramount when facing one, as Hinox are known for tearing entire trees from the ground and using them as weapons. Black Hinox wear metal greaves that conduct electricity rather well. A deft hand can steal weapons off the necklaces they wear."
    },
    {
      no: "150",
      name: "STALNOX",
      cn: "骷髅西诺克斯",
      img: "stalnox.png",
      got: true,
      meta: ["出没", "Hyrule Field"],
      desc: "The mere remains of what was once a giant monster known as a Hinox. These skeletal beasts appear at nighttime. Much like their living counterparts, the Stalnox will tear entire trees from the ground to use as weapons. Furthermore, even if it appears defeated at first, it will keep coming back for more as long as its eye is left intact."
    },
    {
      no: "151",
      name: "MOLDUGA",
      cn: "莫尔德拉吉克",
      img: "molduga.png",
      got: true,
      meta: ["出没", "Gerudo Desert"],
      desc: "This massive monster swims beneath the desert's sand. It spends most of its time submerged, but if it senses sound, it will breach the surface to feast on whatever it can grab. Running around carelessly can be dangerous if you suspect there may be one in the area."
    },
    {
      no: "152",
      name: "MOLDUKING",
      cn: "莫尔德拉吉克王",
      img: "molduking.png",
      got: true,
      desc: "This massive monster swims beneath the desert's sand. It is a subspecies of Molduga that stored up a great deal of energy by sleeping underground for hundreds of years. Its power is superior to Molduga, as its skin is rich with iron and acts as a protective shield."
    },
    {
      no: "153",
      name: "DINRAAL",
      cn: "奥尔龙",
      img: "dinraal.png",
      got: true,
      meta: ["出没", "Eldin Mountains"],
      desc: "A spirit of fire has taken the form of this giant dragon. Making its home in the Eldin region, it's said to have served the Spring of Power since ancient times. An old saying goes, \"The dragon ascends to the heavens as the sun begins to set,\" but nobody has witnessed this in the current age. The flames that coat its body make it dangerous to get near, but Dinraal bears no ill will toward people."
    },
    {
      no: "154",
      name: "NAYDRA",
      cn: "奥拉龙",
      img: "naydra.png",
      got: true,
      meta: ["出没", "Mount Lanayru"],
      desc: "A spirit of ice has taken the form of this giant dragon. Making its home in the Lanayru region, it's said to have served the Spring of Wisdom since ancient times. An old saying goes, \"The dragon ascends to the heavens as the sun begins to set,\" but nobody has seen this in the current age. The ice that coats its body makes it dangerous to get near, but Naydra bears no ill will toward people."
    },
    {
      no: "155",
      name: "FAROSH",
      cn: "奥夫龙",
      img: "farosh.png",
      got: true,
      meta: ["出没", "Lake Hylia"],
      desc: "A spirit of lightning has taken the form of this giant dragon. Making its home in the Faron region, it's said to have served the Spring of Courage since ancient times. An old saying goes, \"The dragon ascends to the heavens as the sun begins to set,\" but nobody has seen this in the current age. The electricity that coats its body makes it dangerous to get near, but Farosh bears no ill will toward people."
    },
    {
      no: "156",
      name: "CURSED BOKOBLIN",
      cn: "被诅咒的波克布林",
      img: "cursed_bokoblin.png",
      got: true,
      desc: "The Malice has given these Bokoblin skulls a sort of life. Devoid of any intelligence the Bokoblin it once belonged to may have had, these pitiful things now exist only to attack anything that gets too close."
    },
    {
      no: "157",
      name: "CURSED MOBLIN",
      cn: "被诅咒的莫力布林",
      img: "cursed_moblin.png",
      got: true,
      desc: "The Malice has given these Moblin skulls a pitiful life after death. The only fragment of their former selves they've held on to is the ferocity innate to all Moblins, so they will attack anyone that approaches."
    },
    {
      no: "158",
      name: "CURSED LIZALFOS",
      cn: "被诅咒的蜥蜴战士",
      img: "cursed_lizalfos.png",
      got: true,
      desc: "The Malice has given these Lizalfos skulls a sorry form of life after death. Only the slyness of their former selves remains, making them faster than Bokoblin skulls. They thoughtlessly attack anyone who approaches."
    },
    {
      no: "159",
      name: "THUNDERBLIGHT GANON",
      cn: "雷咒盖侬",
      img: "thunderblight_ganon.png",
      got: true,
      meta: ["出没", "Divine Beast Vah Naboris"],
      desc: "This phantom of Ganon attacked the Divine Beast Vah Naboris and was responsible for the demise of the Champion Urbosa. It specializes in quick, lightning-based attacks."
    },
    {
      no: "160",
      name: "FIREBLIGHT GANON",
      cn: "火咒盖侬",
      img: "fireblight_ganon.png",
      got: true,
      meta: ["出没", "Divine Beast Vah Rudania"],
      desc: "This phantom of Ganon attacked the Divine Beast Vah Rudania and was responsible for the demise of the Champion Daruk. It attacks with a greatsword and fire magic."
    },
    {
      no: "161",
      name: "WATERBLIGHT GANON",
      cn: "水咒盖侬",
      img: "waterblight_ganon.png",
      got: true,
      meta: ["出没", "Divine Beast Vah Ruta"],
      desc: "This phantom of Ganon attacked the Divine Beast Vah Ruta and was responsible for the demise of the Champion Mipha. It attacks with a spear and ice magic."
    },
    {
      no: "162",
      name: "WINDBLIGHT GANON",
      cn: "风咒盖侬",
      img: "windblight_ganon.png",
      got: true,
      meta: ["出没", "Divine Beast Vah Medoh"],
      desc: "This phantom of Ganon attacked the Divine Beast Vah Medoh and was responsible for the demise of the Champion Revali. It specializes in long-ranged wind attacks."
    },
    {
      no: "163",
      name: "CALAMITY GANON",
      cn: "灾厄盖侬",
      img: "calamity_ganon.png",
      got: true,
      meta: ["出没", "Hyrule Castle"],
      desc: "The source of the darkness that has appeared time and again throughout Hyrule's history. It's been called many names, from \"Great King of Evil\" to \"Calamity.\" Hibernating within a cocoon, it attempted to regenerate a physical form after Link awoke but was forced to confront him in an incomplete state."
    },
    {
      no: "164",
      name: "DARK BEAST GANON",
      cn: "魔兽盖侬",
      img: "dark_beast_ganon.png",
      got: true,
      meta: ["出没", "Hyrule Field"],
      desc: "After Ganon was defeated by Link, the remaining Malice pulled itself together to form this bestial creature. Its appearance and fiendish magic eared it the name of Dark Beast. This form is considered to be Ganon's original, although in this state, his awareness has been consumed entirely by Malice, and all he knows is a desire to rampage and destroy."
    },
    {
      no: "390",
      name: "GOLDEN BOKOBLIN",
      cn: "黄金波克布林",
      img: "golden_bokoblin.png",
      got: true,
      meta: ["出没", "大师模式 · 全海拉鲁"],
      mm: true,
      desc: "大师模式的黄金波克布林。大师模式中部分波克布林以金色姿态出现，拥有远超寻常的体魄与掉落的珍贵战利品。"
    },
    {
      no: "391",
      name: "GOLDEN MOBLIN",
      cn: "黄金莫力布林",
      img: "golden_moblin.png",
      got: true,
      meta: ["出没", "大师模式 · 全海拉鲁"],
      mm: true,
      desc: "大师模式的黄金莫力布林。大师模式中出现的强化个体，攻击与耐性都显著提升。"
    },
    {
      no: "392",
      name: "GOLDEN LIZALFOS",
      cn: "黄金蜥蜴战士",
      img: "golden_lizalfos.png",
      got: true,
      meta: ["出没", "大师模式 · 全海拉鲁"],
      mm: true,
      desc: "大师模式的黄金蜥蜴战士。大师模式中出现的强化个体，行动依旧敏捷而致命。"
    },
    {
      no: "393",
      name: "GOLDEN LYNEL",
      cn: "黄金莱尼尔",
      img: "golden_lynel.png",
      got: true,
      meta: ["出没", "大师模式 · 全海拉鲁"],
      mm: true,
      desc: "大师模式的黄金莱尼尔。大师模式中最强的莱尼尔个体，几乎无人能在正面交锋中取胜。"
    },
    {
      no: "394",
      name: "SKY OCTOROK",
      cn: "天空八爪怪",
      img: "sky_octorok.png",
      got: true,
      meta: ["出没", "大师模式 · 全海拉鲁"],
      mm: true,
      desc: "大师模式中会喷出炸弹的八爪怪，漂浮在天空。一旦进入视野，随时可能发起轰炸。"
    }
  ],
  materials: [
    {
      no: "165",
      name: "APPLE",
      cn: "苹果",
      img: "apple.png",
      got: true,
      meta: ["获取", "Hyrule Field"],
      desc: "A common fruit found on trees all around Hyrule. Eat it fresh, or cook it to increase its effect."
    },
    {
      no: "166",
      name: "PALM FRUIT",
      cn: "棕榈果",
      img: "palm_fruit.png",
      got: true,
      meta: ["获取", "East Necluda"],
      desc: "Fruit from palm trees that grow near the ocean. It doesn't offer any special effects but will increase your heart recovery when used as an ingredient."
    },
    {
      no: "167",
      name: "WILDBERRY",
      cn: "野莓",
      img: "wildberry.png",
      got: true,
      meta: ["获取", "Gerudo Highlands"],
      desc: "A fruit that grows in cold, snowy regions known for its tangy, sweet flavor. It doesn't offer any special effects, but it's a popular cooking ingredient."
    },
    {
      no: "168",
      name: "HEARTY DURIAN",
      cn: "榴莲",
      img: "hearty_durian.png",
      got: true,
      meta: ["获取", "West Necluda"],
      desc: "This fruit's mighty odor has earned it the nickname \"king of fruits.\" It offers immense restorative powers; dishes cooked with it will temporarily increase your maximum hearts."
    },
    {
      no: "169",
      name: "HYDROMELON",
      cn: "水瓜",
      img: "hydromelon.png",
      got: true,
      meta: ["获取", "Gerudo Desert"],
      desc: "This resilient fruit can flourish even in the heat of the desert. The hydrating liquid inside provides a cooling effect that, when cooked, increases your heat resistance."
    },
    {
      no: "170",
      name: "SPICY PEPPER",
      cn: "辣椒",
      img: "spicy_pepper.png",
      got: true,
      meta: ["获取", "Gerudo Desert"],
      desc: "This pepper is exploding with spice. Cook with it to create dishes that will raise your body temperature and help you withstand the cold."
    },
    {
      no: "171",
      name: "VOLTFRUIT",
      cn: "电果",
      img: "voltfruit.png",
      got: true,
      meta: ["获取", "Gerudo Desert"],
      desc: "Cacti found in the Gerudo Desert bear this sweet fruit. It's naturally insulated, so when cooked into a dish, it provides resistance against electricity."
    },
    {
      no: "172",
      name: "FLEET-LOTUS SEEDS",
      cn: "速莲籽",
      img: "fleet-lotus_seeds.png",
      got: true,
      meta: ["获取", "Lanayru Wetlands"],
      desc: "The plant that bears these seeds grows near deep water. The roots draw nutrients from the water, which boosts your movement speed when the seeds are cooked into a dish."
    },
    {
      no: "173",
      name: "MIGHTY BANANAS",
      cn: "强壮香蕉",
      img: "mighty_bananas.png",
      got: true,
      meta: ["获取", "Faron"],
      desc: "This fruit grows mainly in tropical forests of the Faron region. When it's used as an ingredient, the resulting dish will temporarily increase your attack power."
    },
    {
      no: "174",
      name: "HYLIAN SHROOM",
      cn: "海拉鲁蘑菇",
      img: "hylian_shroom.png",
      got: true,
      meta: ["获取", "Hyrule Field"],
      desc: "A common mushroom found near trees around Hyrule. Eat it to restore half a heart."
    },
    {
      no: "175",
      name: "ENDURA SHROOM",
      cn: "耐力蘑菇",
      img: "endura_shroom.png",
      got: true,
      meta: ["获取", "Hyrule Ridge"],
      desc: "A rare yellowish-orange mushroom. Cook it before eating to temporarily increase your stamina limit."
    },
    {
      no: "176",
      name: "STAMELLA SHROOM",
      cn: "精力蘑菇",
      img: "stamella_shroom.png",
      got: true,
      meta: ["获取", "Hyrule Ridge"],
      desc: "A green mushroom that grows near trees in the forest. It's chock-full of natural energy. Cook it to release its stamina-restoration properties."
    },
    {
      no: "177",
      name: "HEARTY TRUFFLE",
      cn: "精力松露",
      img: "hearty_truffle.png",
      got: true,
      meta: ["获取", "Great Hyrule Forest"],
      desc: "This rare mushroom has a rich scent. Cook it before eating to temporarily increase your maximum hearts."
    },
    {
      no: "178",
      name: "BIG HEARTY TRUFFLE",
      cn: "大精力松露",
      img: "big_hearty_truffle.png",
      got: true,
      meta: ["获取", "Hebra Mountains"],
      desc: "Years of going unpicked have allowed this hearty truffle to grow quite large. It's chock- full of nutrients. When cooked into a dish, it temporarily increases your maximum hearts."
    },
    {
      no: "179",
      name: "CHILLSHROOM",
      cn: "冷蘑菇",
      img: "chillshroom.png",
      got: true,
      meta: ["获取", "Hebra Mountains"],
      desc: "Often found at the base of pine trees in cold climates, these mushrooms are cool to the touch and can be used to cook dishes that allow you to stay cool even in arid regions."
    },
    {
      no: "180",
      name: "SUNSHROOM",
      cn: "日蘑菇",
      img: "sunshroom.png",
      got: true,
      meta: ["获取", "Eldin Canyon"],
      desc: "A bright red mushroom that grows in hot climates. Imbued with the power of heat, they can be used to cook dishes that will allow you endure the bitter cold."
    },
    {
      no: "181",
      name: "ZAPSHROOM",
      cn: "电蘑菇",
      img: "zapshroom.png",
      got: true,
      meta: ["获取", "Deep Akkala"],
      desc: "This mushroom grows wild in the Gerudo region. The cap is naturally insulated, so when used in cooking, it will offer protection against electricity."
    },
    {
      no: "182",
      name: "RUSHROOM",
      cn: "灯蘑菇",
      img: "rushroom.png",
      got: true,
      meta: ["获取", "Gerudo Highlands"],
      desc: "A mushroom that can grow almost anywhere but prefers ceilings and sheer cliffs. Cook it before eating to temporarily increase your movement speed."
    },
    {
      no: "183",
      name: "RAZORSHROOM",
      cn: "刀蘑菇",
      img: "razorshroom.png",
      got: true,
      meta: ["获取", "Great Hyrule Forest"],
      desc: "This mushroom is known for the natural slice in its cap. Eating it fosters your competitive spirit. Use it when cooking to prepare a dish that will increase your strength."
    },
    {
      no: "184",
      name: "IRONSHROOM",
      cn: "铁蘑菇",
      img: "ironshroom.png",
      got: true,
      meta: ["获取", "West Necluda"],
      desc: "The cap of this mushroom is very hard. Use it when cooking to prepare a dish that increases you defense."
    },
    {
      no: "185",
      name: "SILENT SHROOM",
      cn: "静蘑菇",
      img: "silent_shroom.png",
      got: true,
      meta: ["获取", "Lanayru Great Spring"],
      desc: "A strange mushroom that glows softly in the forest at night. Cooking it into a dish unlocks the nutrients in its cap, resulting in a meal that will allow you to move stealthily."
    },
    {
      no: "186",
      name: "HYRULE HERB",
      cn: "海拉鲁药草",
      img: "hyrule_herb.png",
      got: true,
      meta: ["获取", "Hyrule Field"],
      desc: "This healthy herb grows abundantly in the plains of Hyrule. Cook it before eating to increase the number of hearts it restores."
    },
    {
      no: "187",
      name: "HEARTY RADISH",
      cn: "精力萝卜",
      img: "hearty_radish.png",
      got: true,
      meta: ["获取", "Hyrule Ridge"],
      desc: "A rare radish that grows best in sunny plains. Cook it before eating to temporarily increase your maximum hearts."
    },
    {
      no: "188",
      name: "BIG HEARTY RADISH",
      cn: "大精力萝卜",
      img: "big_hearty_radish.png",
      got: true,
      meta: ["获取", "Akkala Highlands"],
      desc: "This hearty radish has grown much larger than the average radish. It's rich in analeptic compounds that, when cooked into a dish, temporarily increase your maximum hearts."
    },
    {
      no: "189",
      name: "COOL SAFFLINA",
      cn: "清凉红花",
      img: "cool_safflina.png",
      got: true,
      meta: ["获取", "Hebra Mountains"],
      desc: "This medicinal plant grows in high elevations, such as mountains in the Hebra or Gerudo regions. When cooked into a dish, it will temporarily increase your heat resistance."
    },
    {
      no: "190",
      name: "WARM SAFFLINA",
      cn: "温暖红花",
      img: "warm_safflina.png",
      got: true,
      meta: ["获取", "Gerudo Desert"],
      desc: "This medicinal plant grows in hot regions, such as the Gerudo Desert. It's warm to the touch and increases your cold resistance when cooked into a dish."
    },
    {
      no: "191",
      name: "ELECTRIC SAFFLINA",
      cn: "电红花",
      img: "electric_safflina.png",
      got: true,
      meta: ["获取", "Gerudo Desert"],
      desc: "This medicinal plant grows abundantly in the Gerudo Desert. Its peculiar fibers conduct electricity, which will increase your electricity resistance when cooked into a dish."
    },
    {
      no: "192",
      name: "SWIFT CARROT",
      cn: "速胡萝卜",
      img: "swift_carrot.png",
      got: true,
      meta: ["获取", "Kakariko Village"],
      desc: "This carrot is cultivated extensively in Kakariko Village. It strengthens the legs and hips when cooked into a dish, which helps increase your movement speed."
    },
    {
      no: "193",
      name: "ENDURA CARROT",
      cn: "耐力胡萝卜",
      img: "endura_carrot.png",
      got: true,
      meta: ["获取", "Hyrule Ridge"],
      desc: "Highly valued as a medicinal plant, this carrot contains large amounts of nourishing energy. When cooked into a dish, it boosts your stamina beyond its maximum limit."
    },
    {
      no: "194",
      name: "FORTIFIED PUMPKIN",
      cn: "装甲南瓜",
      img: "fortified_pumpkin.png",
      got: true,
      meta: ["获取", "Kakariko Village"],
      desc: "An extremely tough pumpkin raised in village fields. When cooked, that toughness manifests itself by considerably upping defense."
    },
    {
      no: "195",
      name: "SWIFT VIOLET",
      cn: "速紫罗兰",
      img: "swift_violet.png",
      got: true,
      meta: ["获取", "Gerudo Highlands"],
      desc: "This vitality-rich flower blooms mainly on cliffsides. When cooked into a dish, the nourishing compounds increase your movement speed."
    },
    {
      no: "196",
      name: "MIGHTY THISTLE",
      cn: "强壮蓟",
      img: "mighty_thistle.png",
      got: true,
      meta: ["获取", "West Necluda"],
      desc: "This medicinal plant is known for its sharp thorns and for the fruit it bears. The fruit contains a compound that increases attack power when cooked into a dish."
    },
    {
      no: "197",
      name: "ARMORANTH",
      cn: "装甲花",
      img: "armoranth.png",
      got: true,
      meta: ["获取", "Akkala Highlands"],
      desc: "This tough medicinal plant cannot be broken, but it can be cooked. Its durable yet flexible fibers raise your defense when cooked into a dish."
    },
    {
      no: "198",
      name: "BLUE NIGHTSHADE",
      cn: "蓝色夜光草",
      img: "blue_nightshade.png",
      got: true,
      meta: ["获取", "West Necluda"],
      desc: "A plant that grows in the quieter areas of Hyrule. At night, it gives off a soft glow. Cook with it to increase your stealth."
    },
    {
      no: "199",
      name: "SILENT PRINCESS",
      cn: "静谧公主",
      img: "silent_princess.png",
      got: true,
      meta: ["获取", "Hyrule Ridge"],
      desc: "This lovely flower was said to have been a favorite of the princess of Hyrule. Once feared to have gone extinct, it's recently been spotted growing in the wild."
    },
    {
      no: "200",
      name: "COURSER BEE HONEY",
      cn: "快蜂蜂蜜",
      img: "courser_bee_honey.png",
      got: true,
      meta: ["获取", "Hyrule Field"],
      desc: "Honey straight from the hive is chock-full of nutrients. Cooking this into a meal unlocks the potential of these nutrients and provides a stamina-recovery effect."
    }
  ],
  equipment: [
    {
      no: "201",
      name: "MASTER SWORD",
      cn: "大师之剑",
      img: "master_sword.png",
      got: true,
      desc: "The legendary sword that seals the darkness. Its blade gleams with a sacred luster that can oppose the Calamity. Only a hero chosen by the sword itself can wield it."
    },
    {
      no: "202",
      name: "TREE BRANCH",
      cn: "树枝",
      img: "tree_branch.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "Wooden branches such as this are pretty common, but it's surprisingly well-balanced. It doesn't do much damage, but can serve as a weapon in a pinch."
    },
    {
      no: "203",
      name: "TORCH",
      cn: "火把",
      img: "torch.png",
      got: true,
      meta: ["来源", "Great Hyrule Forest"],
      desc: "This torch will stay lit once ignited, but if you put it away, the flame will be extinguished until you light it again."
    },
    {
      no: "204",
      name: "SOUP LADLE",
      cn: "汤勺",
      img: "soup_ladle.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "A kitchen implement often used for serving delicious soups. It was carved from the wood of a sturdy tree, so it actually packs quite the wallop."
    },
    {
      no: "205",
      name: "BOOMERANG",
      cn: "回旋镖",
      img: "boomerang.png",
      got: true,
      meta: ["来源", "West Necluda"],
      desc: "This throwing weapon was originally used by the forest-dwelling Koroks. Its unique shape allows it to return after being thrown."
    },
    {
      no: "206",
      name: "SPRING-LOADED HAMMER",
      cn: "弹簧锤",
      img: "spring-loaded_hammer.png",
      got: true,
      desc: "This strange hammer is one of Kilton's specialties. Being struck by it doesn't hurt much, but the forth swing in a string of attacks will send the victim flying."
    },
    {
      no: "207",
      name: "TRAVELER'S SWORD",
      cn: "旅人之剑",
      img: "traveler's_sword.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "A very common sword often kept by travelers to fend off small beasts. It's fairly durable, but a bit unreliable against monsters."
    },
    {
      no: "208",
      name: "SOLDIER'S BROADSWORD",
      cn: "士兵之剑",
      img: "soldier's_broadsword.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "A sword brandished by the soldiers who once protected Hyrule Castle. Its durable blade is well tuned for slaying monsters."
    },
    {
      no: "209",
      name: "KNIGHT'S BROADSWORD",
      cn: "骑士之剑",
      img: "knight's_broadsword.png",
      got: true,
      meta: ["来源", "Gerudo Desert"],
      desc: "Knights of Hyrule once carried this sword. These days it's the weapon of choice for seasoned adventurers thanks to its ease of use and high attack power."
    },
    {
      no: "210",
      name: "ROYAL BROADSWORD",
      cn: "王族之剑",
      img: "royal_broadsword.png",
      got: true,
      meta: ["来源", "Tabantha Frontier"],
      desc: "The Hyrulean royal family would award this sword to knights who achieved remarkable feats. A sword that balances strength and beauty as elegantly as this one is a rare find."
    },
    {
      no: "211",
      name: "FOREST DWELLER'S SWORD",
      cn: "森林居民的剑",
      img: "forest_dweller's_sword.png",
      got: true,
      meta: ["来源", "Great Hyrule Forest"],
      desc: "Koroks made this sword for Hylians. It's made of wood, so it isn't the best choice for head-on attacks. Its original intent was likely clearing vines to forge paths through forests."
    },
    {
      no: "212",
      name: "ZORA SWORD",
      cn: "卓拉之剑",
      img: "zora_sword.png",
      got: true,
      meta: ["来源", "Lanayru Great Spring"],
      desc: "The ornamentation that adorns this blade is a traditional Zora design. It's forged from a very durable and rust-proof metal."
    },
    {
      no: "213",
      name: "FEATHERED EDGE",
      cn: "羽刃",
      img: "feathered_edge.png",
      got: true,
      meta: ["来源", "Tabantha Frontier"],
      desc: "Rito craftsmen forged this lightweight, double-edged sword so Rito warriors could soar into battle unhindered by its weight."
    },
    {
      no: "214",
      name: "GERUDO SCIMITAR",
      cn: "格鲁德弯刀",
      img: "gerudo_scimitar.png",
      got: true,
      meta: ["来源", "Gerudo Highlands"],
      desc: "This common sword is often carried by Gerudo women for self-defense. Its short, curved blade is easily recognized."
    },
    {
      no: "215",
      name: "MOONLIGHT SCIMITAR",
      cn: "月光弯刀",
      img: "moonlight_scimitar.png",
      got: true,
      meta: ["来源", "Gerudo Highlands"],
      desc: "Delicate Gerudo carvings decorate this curved sword. The engraved blade is extremely sharp. Apparently it once served ceremonial purposes in festivals."
    },
    {
      no: "216",
      name: "SCIMITAR OF THE SEVEN",
      cn: "七宝匕首",
      img: "scimitar_of_the_seven.png",
      got: true,
      meta: ["来源", "Gerudo Town"],
      desc: "A famous sword once beloved by the Gerudo Champion Urbosa. It is said that when Urbosa swung this sword in battle, her movements resembled a beautiful dance."
    },
    {
      no: "217",
      name: "EIGHTFOLD BLADE",
      cn: "八重之剑",
      img: "eightfold_blade.png",
      got: true,
      meta: ["来源", "West Necluda"],
      desc: "A single-edged sword traditional to the Sheikah tribe. Forged using ancient technology, it's said to be among the sharpest conventional weapons ever made."
    },
    {
      no: "218",
      name: "ANCIENT SHORT SWORD",
      cn: "古代短剑",
      img: "ancient_short_sword.png",
      got: true,
      desc: "The blade of this ancient sword was made using an ancient power lost to this modern age. Its blade appears only when drawn, and its cutting power surpasses metal swords."
    },
    {
      no: "219",
      name: "RUSTY BROADSWORD",
      cn: "锈蚀之剑",
      img: "rusty_broadsword.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "This once-fearsome sword has seen better days. It can do some damage in the right hands but also breaks quickly."
    },
    {
      no: "220",
      name: "ROYAL GUARD'S SWORD",
      cn: "近卫之剑",
      img: "royal_guard's_sword.png",
      got: true,
      desc: "A Sheikah-made replica of the sword that seals the darkness. It was made with ancient technology to oppose the Great Calamity, but its low durability made it inefficient."
    },
    {
      no: "221",
      name: "FLAMEBLADE",
      cn: "火焰剑",
      img: "flameblade.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "This magical sword was forged in the lava of Death Mountain. It leaves white-hot flames in its wake when the blade glows red."
    },
    {
      no: "222",
      name: "FROSTBLADE",
      cn: "冰霜剑",
      img: "frostblade.png",
      got: true,
      meta: ["来源", "Gerudo Highlands"],
      desc: "A magical sword forged in the frigid mountains of the Hebra region. When the blade glows blue, enemies struck by it will become frozen."
    },
    {
      no: "223",
      name: "THUNDERBLADE",
      cn: "雷电剑",
      img: "thunderblade.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "A magical sword forged and refined by lightning from the Hyrule Hills. When the blade shines with a golden light, it will electrocute enemies struck by it."
    },
    {
      no: "224",
      name: "BOKO CLUB",
      cn: "波克棒",
      img: "boko_club.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "A crude Bokoblin club made to clobber small prey. It's essentially a stick, so its durability is low."
    },
    {
      no: "225",
      name: "SPIKED BOKO CLUB",
      cn: "钉刺波克棒",
      img: "spiked_boko_club.png",
      got: true,
      meta: ["来源", "Faron Grasslands"],
      desc: "A reinforced Bokoblin club made to maximize damage. The sharpened bones jabbed into make it a brutal weapon."
    },
    {
      no: "226",
      name: "DRAGONBONE BOKO CLUB",
      cn: "龙骨波克棒",
      img: "dragonbone_boko_club.png",
      got: true,
      meta: ["来源", "Hyrule Ridge"],
      desc: "This Bokoblin club has been reinforced with fossilized bones to maximize clobbering potential. Only the brawniest of Bokoblins can manage its immense weight."
    },
    {
      no: "227",
      name: "LIZAL BOOMERANG",
      cn: "蜥蜴回旋镖",
      img: "lizal_boomerang.png",
      got: true,
      meta: ["来源", "Lake Hylia"],
      desc: "A curved sword favored by the Lizalfos. It can be used to attack directly or can be thrown like a boomerang."
    },
    {
      no: "228",
      name: "LIZAL FORKED BOOMERANG",
      cn: "双叉蜥蜴回旋镖",
      img: "lizal_forked_boomerang.png",
      got: true,
      meta: ["来源", "Gerudo Desert"],
      desc: "Blue Lizalfos in particular like this weapon. It has one more blade than the Lizal boomerang to give it additional cutting power, and it still returns when thrown."
    },
    {
      no: "229",
      name: "LIZAL TRI-BOOMERANG",
      cn: "三叉蜥蜴回旋镖",
      img: "lizal_tri-boomerang.png",
      got: true,
      meta: ["来源", "Hebra Mountains"],
      desc: "More blades mean more attack power! It can be used as a boomerang, but all those blades make that a bit more dangerous. Carried by Black Lizalfos seasoned in battle."
    },
    {
      no: "230",
      name: "GUARDIAN SWORD",
      cn: "守护者之剑",
      img: "guardian_sword.png",
      got: true,
      meta: ["来源", "Eldin Canyon"],
      desc: "A sword often wielded by Guardian Scouts. Its blue energy blade is a product of ancient technology. It's not very durable."
    },
    {
      no: "231",
      name: "GUARDIAN SWORD+",
      cn: "守护者之剑+",
      img: "guardian_sword+.png",
      got: true,
      meta: ["来源", "Gerudo Highlands"],
      desc: "This Guardian sword has enhanced power over the standard model. Its cutting capabilities are improved, and its durability has seen a slight uptick."
    },
    {
      no: "232",
      name: "GUARDIAN SWORD++",
      cn: "守护者之剑++",
      img: "guardian_sword++.png",
      got: true,
      meta: ["来源", "Hebra Mountains"],
      desc: "The abilities of this Guardian sword have been boosted to the maximum., as evidenced by its increase in size. It slices through armor like a hot knife through butter!"
    },
    {
      no: "233",
      name: "LYNEL SWORD",
      cn: "莱尼尔之剑",
      img: "lynel_sword.png",
      got: true,
      meta: ["来源", "Lanayru Great Spring"],
      desc: "This Lynel-made sword was designed with smashing in mind rather than slicing. It's on the heavy side compared to what Hylians are used to, but it's very strong."
    },
    {
      no: "234",
      name: "MIGHTY LYNEL SWORD",
      cn: "强壮莱尼尔之剑",
      img: "mighty_lynel_sword.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "This Lynel-made sword boasts more blades and more attack power. A skilled Lynel can draw this sword simply in passing and still cut a foe in two."
    },
    {
      no: "235",
      name: "SAVAGE LYNEL SWORD",
      cn: "凶暴莱尼尔之剑",
      img: "savage_lynel_sword.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "A brutal sword carried by white-haired Lynels. The savage blades are strong enough to cut down any foe, no matter how strong."
    },
    {
      no: "236",
      name: "FIRE ROD",
      cn: "火焰杖",
      img: "fire_rod.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "A magical rod that can cast fireballs, crafted by an ancient magician. The rod will break if it strikes something directly, so use it wisely."
    },
    {
      no: "237",
      name: "METEOR ROD",
      cn: "流星杖",
      img: "meteor_rod.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "A magical rod that can cast three fireballs at once, crafted by an ancient magician. It will break upon running out of magical energy, so make it last!"
    },
    {
      no: "238",
      name: "ICE ROD",
      cn: "冰霜杖",
      img: "ice_rod.png",
      got: true,
      meta: ["来源", "Gerudo Highlands"],
      desc: "A magical rod crafted from refined ice found in the Hebra Mountains. This rod can cast waves of freezing air. Great for magic - not so great for melee."
    },
    {
      no: "239",
      name: "BLIZZARD ROD",
      cn: "暴雪杖",
      img: "blizzard_rod.png",
      got: true,
      meta: ["来源", "Gerudo Highlands"],
      desc: "A magical rod that can cast extreme cold in a wide range. These are crafted from refined ice found at the summit of Hebra peak. It will break when depleted."
    },
    {
      no: "240",
      name: "LIGHTNING ROD",
      cn: "雷电杖",
      img: "lightning_rod.png",
      got: true,
      meta: ["来源", "West Necluda"],
      desc: "A magical rod that can shoot balls of electricity. Its gem contains lightning from the Hyrule Hills. It's not recommended to use as a melee weapon."
    },
    {
      no: "241",
      name: "THUNDERSTORM ROD",
      cn: "雷暴杖",
      img: "thunderstorm_rod.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "A magical rod that can hurl three balls of electricity at once. Its gem contains electricity from the Hyrule Hills, and the rod will break when that electricity runs out."
    },
    {
      no: "242",
      name: "VICIOUS SICKLE",
      cn: "恶毒镰刀",
      img: "vicious_sickle.png",
      got: true,
      meta: ["来源", "Gerudo Highlands"],
      desc: "A grim weapon favored by the Yiga. The half-moon shape of the blade allows for the rapid delivery of fatal wounds and serves as a symbol of their terror. Its durability is low."
    },
    {
      no: "243",
      name: "DEMON CARVER",
      cn: "恶魔雕刻刀",
      img: "demon_carver.png",
      got: true,
      desc: "This lethal weapon is forged by the Yiga. Its unique shape facilitates the sound dispatching of any target and strikes fear into the hearts of all who see it."
    },
    {
      no: "244",
      name: "ONE-HIT OBLITERATOR",
      cn: "一击必杀刃",
      img: "one-hit_obliterator.png",
      got: true,
      desc: "A weapon that defeats foes with one hit and causes the user to die within one hit. It loses its sheen and power after two consecutive uses, but it will eventually regain both."
    },
    {
      no: "245",
      name: "BOKOBLIN ARM",
      cn: "波克布林手臂",
      img: "bokoblin_arm.png",
      got: true,
      meta: ["来源", "Greater Hyrule"],
      desc: "A skeletal arm that keeps moving even after it's severed from its body. It's kind of gross to strap it to your back, but it'll do in a pinch. It's old and fragile, so it's quick to break."
    },
    {
      no: "246",
      name: "LIZALFOS ARM",
      cn: "蜥蜴战士手臂",
      img: "lizalfos_arm.png",
      got: true,
      meta: ["来源", "Greater Hyrule"],
      desc: "The arm of a Stalizalfos that continues to struggle even in death. It can be used as a weapon, but it's very brittle. You can feel it wiggling when you strap it to your back..."
    },
    {
      no: "247",
      name: "KOROK LEAF",
      cn: "克洛格团扇",
      img: "korok_leaf.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "A single swing of this giant, sturdy leaf can create a gust of wind strong enough to blow away light objects. These will sometimes fall off trees as they're chopped down."
    },
    {
      no: "248",
      name: "FARMING HOE",
      cn: "农用锄头",
      img: "farming_hoe.png",
      got: true,
      meta: ["来源", "East Necluda"],
      desc: "A farming tool primarily used for tilling fields. Its fine craftsmanship is sturdy enough to withstand backbreaking fieldwork, but its battle applications are untested."
    },
    {
      no: "249",
      name: "BOAT OAR",
      cn: "船桨",
      img: "boat_oar.png",
      got: true,
      meta: ["来源", "East Necluda"],
      desc: "Made for paddling boats, but it was made sturdy enough to fight strong currents. Maybe it's useful for self-defense in a pinch."
    },
    {
      no: "250",
      name: "WOODCUTTER'S AXE",
      cn: "樵夫之斧",
      img: "woodcutter's_axe.png",
      got: true,
      meta: ["来源", "West Necluda"],
      desc: "A woodcutter's tool of choice for felling trees. Its formidable weight and uneven balancing make it a slow, inefficient weapon."
    },
    {
      no: "251",
      name: "DOUBLE AXE",
      cn: "双手斧",
      img: "double_axe.png",
      got: true,
      meta: ["来源", "West Necluda"],
      desc: "This double-sided axe was designed with fighting in mind. It's a bit unwieldy, so it requires a well-practiced technique to use efficiently."
    },
    {
      no: "252",
      name: "IRON SLEDGEHAMMER",
      cn: "铁锤",
      img: "iron_sledgehammer.png",
      got: true,
      meta: ["来源", "Eldin Canyon"],
      desc: "This large iron sledgehammer was originally used for mining, but it works reasonably well as a weapon too."
    },
    {
      no: "253",
      name: "GIANT BOOMERANG",
      cn: "巨大回旋镖",
      img: "giant_boomerang.png",
      got: true,
      meta: ["来源", "West Necluda"],
      desc: "This massive boomerang requires two hands. Originally used for hunting, it was modified for use as a weapon. The blades on the inner curves make it a bit trick to wield."
    },
    {
      no: "254",
      name: "TRAVELER'S CLAYMORE",
      cn: "旅人双手剑",
      img: "traveler's_claymore.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "A basic two-handed sword often wielded by aspiring adventurers. Its immense weight can knock enemies' shields right out of their hands."
    },
    {
      no: "255",
      name: "SOLDIER'S CLAYMORE",
      cn: "士兵双手剑",
      img: "soldier's_claymore.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "A two-handed sword designed for combat. It's heavy and hard to use but has decent build quality and durability."
    },
    {
      no: "256",
      name: "KNIGHT'S CLAYMORE",
      cn: "骑士双手剑",
      img: "knight's_claymore.png",
      got: true,
      meta: ["来源", "Gerudo Desert"],
      desc: "Only the most confident of Hyrule Castle's knights carried this two-handed sword. Its cutting edge is finely honed."
    },
    {
      no: "257",
      name: "ROYAL CLAYMORE",
      cn: "王族双手剑",
      img: "royal_claymore.png",
      got: true,
      meta: ["来源", "Tabantha Frontier"],
      desc: "A two-handed sword issued to the Hyrulean royal family's immediate guard detail. Its powerful strikes are said to crush an opponent's body and resolve alike."
    },
    {
      no: "258",
      name: "SILVER LONGSWORD",
      cn: "白银长刀",
      img: "silver_longsword.png",
      got: true,
      meta: ["来源", "Lanayru Great Spring"],
      desc: "Although the Zora prefer spears to swords, they made this two-handed weapon using a special metal. It found popularity among Hylians for its unique design."
    },
    {
      no: "259",
      name: "COBBLE CRUSHER",
      cn: "碎石锤",
      img: "cobble_crusher.png",
      got: true,
      meta: ["来源", "Eldin Canyon"],
      desc: "A Goron-made two-handed weapon. It's made from thick, hard metal and has no cutting edge, so it relies on its sheer weight to crush all opponents."
    },
    {
      no: "260",
      name: "STONE SMASHER",
      cn: "巨石锤",
      img: "stone_smasher.png",
      got: true,
      meta: ["来源", "Eldin Canyon"],
      desc: "A two-handed weapon forged from a rare metal mined in Goron City. Its center of gravity is at its tip, so it uses centrifugal force and its sheer weight to smash opponents flat."
    },
    {
      no: "261",
      name: "BOULDER BREAKER",
      cn: "碎岩锤",
      img: "boulder_breaker.png",
      got: true,
      meta: ["来源", "Eldin Canyon"],
      desc: "This two-handed weapon was once wielded by the Goron Champion Daruk. Daruk made swinging it around look easy, but a Hylian would need and immense amount of strength."
    },
    {
      no: "262",
      name: "GOLDEN CLAYMORE",
      cn: "黄金双手剑",
      img: "golden_claymore.png",
      got: true,
      meta: ["来源", "Gerudo Highlands"],
      desc: "Only the most talented Gerudo sword fighters carry this two-handed sword. It's actually much lighter than it appears and is surprisingly easy to wield."
    },
    {
      no: "263",
      name: "EIGHTFOLD LONGBLADE",
      cn: "八重长刀",
      img: "eightfold_longblade.png",
      got: true,
      meta: ["来源", "West Necluda"],
      desc: "A single-edged sword seldom seen in Hyrule. This weapon is passed down through the Sheikah tribe and has an astonishingly shape edge ideal for slicing."
    },
    {
      no: "264",
      name: "EDGE OF DUALITY",
      cn: "二段之刃",
      img: "edge_of_duality.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "A curious double-edged sword crafted using Sheikah technology. It was originally made for Hyrulean knights unfamiliar with single-edged blades."
    },
    {
      no: "265",
      name: "ANCIENT BLADESAW",
      cn: "古代锯刀",
      img: "ancient_bladesaw.png",
      got: true,
      desc: "This two-handed sword was forged using ancient Sheikah technology. Its unique rotating blades give it impressive cutting power that will slice enemies to shreds."
    },
    {
      no: "266",
      name: "RUSTY CLAYMORE",
      cn: "锈蚀双手剑",
      img: "rusty_claymore.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "A two-handed sword not properly cared for. Although it can be used as a weapon, its durability is very low. Don't expect it to last for more than a few strikes."
    },
    {
      no: "267",
      name: "ROYAL GUARD'S CLAYMORE",
      cn: "近卫双手剑",
      img: "royal_guard's_claymore.png",
      got: true,
      desc: "The Sheikah used the very essence of ancient technology to forge this greatsword. It was designed to oppose the Calamity, but its low durability made it impractical in battle."
    },
    {
      no: "268",
      name: "GREAT FLAMEBLADE",
      cn: "大火焰剑",
      img: "great_flameblade.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "This magic-infused greatsword was forged in the fires of Death Mountain by Goron smiths in an ancient age. Attack when the blade glows red to expel flames."
    },
    {
      no: "269",
      name: "GREAT FROSTBLADE",
      cn: "大冰霜剑",
      img: "great_frostblade.png",
      got: true,
      meta: ["来源", "Hebra Mountains"],
      desc: "This magic infused greatsword was forged by smelting ore found in the Hebra Mountains' permafrost. Attack when the blade glows blue to expel freezing air."
    },
    {
      no: "270",
      name: "GREAT THUNDERBLADE",
      cn: "大雷电剑",
      img: "great_thunderblade.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "This magic-infused greatsword was forged by the Hyrulean royal family using lightning from the Hyrule Hills. Attack when the blade glows golden to expel lightning."
    },
    {
      no: "271",
      name: "BOKO BAT",
      cn: "波克棒槌",
      img: "boko_bat.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "A clunky club made by a Bokoblin. If you swing it at an enemy's shield it may be able to knock the shield out of your foe's hand."
    },
    {
      no: "272",
      name: "SPIKED BOKO BAT",
      cn: "钉刺波克棒槌",
      img: "spiked_boko_bat.png",
      got: true,
      meta: ["来源", "Faron Grasslands"],
      desc: "After much consideration by Bokoblins on how to improve the Boko bat, they simply attached sharp spikes to it. A skilled fighter can cause immense damage with this."
    },
    {
      no: "273",
      name: "DRAGONBONE BOKO BAT",
      cn: "龙骨波克棒槌",
      img: "dragonbone_boko_bat.png",
      got: true,
      meta: ["来源", "Hyrule Ridge"],
      desc: "Used only by the toughest Bokoblin warriors, this Boko bat has been fortified by fossilized bone. It boasts a high durability and is strong enough to beat down powerful foes."
    },
    {
      no: "274",
      name: "MOBLIN CLUB",
      cn: "莫力棒",
      img: "moblin_club.png",
      got: true,
      meta: ["来源", "Gerudo Highlands"],
      desc: "A crudely fashioned club favored by Moblins. It's carved from a sturdy tree but is sloppily made, so it breaks easily."
    },
    {
      no: "275",
      name: "SPIKED MOBLIN CLUB",
      cn: "钉刺莫力棒",
      img: "spiked_moblin_club.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "Animal bone has been affixed to this Moblin club to greatly improve its damage."
    },
    {
      no: "276",
      name: "DRAGONBONE MOBLIN CLUB",
      cn: "龙骨莫力棒",
      img: "dragonbone_moblin_club.png",
      got: true,
      meta: ["来源", "Hebra Mountains"],
      desc: "The bone of an ancient beast has been affixed to this Moblin club, further increasing its damage. Moblins carrying these in battle are particularly dangerous."
    },
    {
      no: "277",
      name: "ANCIENT BATTLE AXE",
      cn: "古代战斧",
      img: "ancient_battle_axe.png",
      got: true,
      meta: ["来源", "Gerudo Desert"],
      desc: "A weapon used by Guardian Scouts. Its unique blade was forged using ancient technology. Although powerful, its unusual shape causes it to break easily."
    },
    {
      no: "278",
      name: "ANCIENT BATTLE AXE+",
      cn: "古代战斧+",
      img: "ancient_battle_axe+.png",
      got: true,
      meta: ["来源", "Akkala Highlands"],
      desc: "This ancient battle axe's damage output has been increased to maximum. It's sharp enough to cut through almost anything, so it may have been used to forge new routes."
    },
    {
      no: "279",
      name: "ANCIENT BATTLE AXE++",
      cn: "古代战斧++",
      img: "ancient_battle_axe++.png",
      got: true,
      meta: ["来源", "Hebra Mountains"],
      desc: "This ancient battle axe's damage output is scaled up to peak performance. Ancient technology makes it possible to enhance cutting power beyond metal weapons' limits."
    },
    {
      no: "280",
      name: "LYNEL CRUSHER",
      cn: "莱尼尔碎击锤",
      img: "lynel_crusher.png",
      got: true,
      meta: ["来源", "Gerudo Highlands"],
      desc: "This Lynel-made two-handed weapon has been reinforced to increase its durability and striking power. Its overwhelming heft will crush your foe, shield and all."
    },
    {
      no: "281",
      name: "MIGHTY LYNEL CRUSHER",
      cn: "强壮莱尼尔碎击锤",
      img: "mighty_lynel_crusher.png",
      got: true,
      meta: ["来源", "Gerudo Highlands"],
      desc: "This Lynel-made two-handed weapon has been reinforced to increase its durability and striking power. Its overwhelming heft will crush your foe, shield and all."
    },
    {
      no: "282",
      name: "SAVAGE LYNEL CRUSHER",
      cn: "凶暴莱尼尔碎击锤",
      img: "savage_lynel_crusher.png",
      got: true,
      meta: ["来源", "Hebra Mountains"],
      desc: "This Lynel-made two-handed weapon is immensely heavy thank to a rare metal from Death Mountain's peak. The power of its downward swing is in a class all of its own."
    },
    {
      no: "283",
      name: "WINDCLEAVER",
      cn: "风斩刀",
      img: "windcleaver.png",
      got: true,
      meta: ["来源", "Gerudo Highlands"],
      desc: "This sword is favored by high-ranking members of the Yiga. When wielded by a proficient fighter, its unique shape cleaves the very wind and creates a vacuum."
    },
    {
      no: "284",
      name: "MOBLIN ARM",
      cn: "莫力布林手臂",
      img: "moblin_arm.png",
      got: true,
      meta: ["来源", "Greater Hyrule"],
      desc: "A Moblin bone that continues to move even after being detached from its body. The bone is thick enough to be used as a weapon but is extremely brittle and easily broken."
    },
    {
      no: "285",
      name: "WOODEN MOP",
      cn: "木拖把",
      img: "wooden_mop.png",
      got: true,
      meta: ["来源", "East Necluda"],
      desc: "Just a mop to the untrained eye, it excels at tidying up the place. But it owes its sturdy construction to a true craftsman, so it actually has some combat merit."
    },
    {
      no: "286",
      name: "FARMER'S PITCHFORK",
      cn: "农用叉",
      img: "farmer's_pitchfork.png",
      got: true,
      meta: ["来源", "East Necluda"],
      desc: "A farming tool used to collect hay efficiently. It's light enough to be used by anyone. The four prongs are very sharp."
    },
    {
      no: "287",
      name: "FISHING HARPOON",
      cn: "捕鱼叉",
      img: "fishing_harpoon.png",
      got: true,
      meta: ["来源", "East Necluda"],
      desc: "A fisherman's tool that excels at catching large fish. Its particularly sharp spearhead makes it valuable as a weapon as well."
    },
    {
      no: "288",
      name: "THROWING SPEAR",
      cn: "投枪",
      img: "throwing_spear.png",
      got: true,
      meta: ["来源", "West Necluda"],
      desc: "A specialized spear weighted to excel as a throwing weapon. It's perfectly balanced to be thrown harder than your average spear, able to pierce targets from a great distance."
    },
    {
      no: "289",
      name: "TRAVELER'S SPEAR",
      cn: "旅人之枪",
      img: "traveler's_spear.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "A spear used mainly by travelers to fend off wolves and other beasts. It's easy to hold and simple to use."
    },
    {
      no: "290",
      name: "SOLDIER'S SPEAR",
      cn: "士兵之枪",
      img: "soldier's_spear.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "A long spear once used by the guards of Hyrule Castle. Easy to use but difficult to master. The iron tip is very sturdy, and the shaft will not burn when exposed to flame."
    },
    {
      no: "291",
      name: "KNIGHT'S HALBERD",
      cn: "骑士长枪",
      img: "knight's_halberd.png",
      got: true,
      meta: ["来源", "Tabantha Frontier"],
      desc: "A spear used by knights adept in mounted combat. The spearhead is modeled after an axe."
    },
    {
      no: "292",
      name: "ROYAL HALBERD",
      cn: "王族长枪",
      img: "royal_halberd.png",
      got: true,
      meta: ["来源", "Gerudo Highlands"],
      desc: "This spear was issued to the knights who guarded Hyrule Castle's throne room. Its ornate design was applied by a craftsman in service to the royal family."
    },
    {
      no: "293",
      name: "FOREST DWELLER'S SPEAR",
      cn: "森林居民的长枪",
      img: "forest_dweller's_spear.png",
      got: true,
      meta: ["来源", "Great Hyrule Forest"],
      desc: "The Koroks made this spear for Hylians. The shaft is made from a light, sturdy wood, offering ease of use. The spearhead is made from a much harder wood, offering strength."
    },
    {
      no: "294",
      name: "ZORA SPEAR",
      cn: "卓拉之枪",
      img: "zora_spear.png",
      got: true,
      meta: ["来源", "Lanayru Great Spring"],
      desc: "This spear is a Zora's weapon of choice. It's lighter than it looks due to being made from a special metal and is used by the Zora for both fishing and protecting their domain."
    },
    {
      no: "295",
      name: "SILVERSCALE SPEAR",
      cn: "银鳞枪",
      img: "silverscale_spear.png",
      got: true,
      meta: ["来源", "Akkala Highlands"],
      desc: "A most skilled Zora fighters wield this spear. Its beautiful fish-tail design belies its impressive strength; the spearhead can piece even the toughest scales."
    },
    {
      no: "296",
      name: "CEREMONIAL TRIDENT",
      cn: "仪式枪",
      img: "ceremonial_trident.png",
      got: true,
      meta: ["来源", "Lanayru Great Spring"],
      desc: "A spear modeled after the Lightscale trident wielded by the Zora Champion Mipha. They may be identical in appearance, but this spear's strength and durability are inferior."
    },
    {
      no: "297",
      name: "LIGHTSCALE TRIDENT",
      cn: "光鳞枪",
      img: "lightscale_trident.png",
      got: true,
      meta: ["来源", "Lanayru Great Spring"],
      desc: "A spear of peerless grace cherished by the Zora Champion Mipha. Although Mipha specialized in healing abilities, her spearmanship was in a class all its own."
    },
    {
      no: "298",
      name: "DRILLSHAFT",
      cn: "钻头枪",
      img: "drillshaft.png",
      got: true,
      meta: ["来源", "Eldin Canyon"],
      desc: "Goron artisans used recycled metal to forge this weapon. The tip is made from an old excavation bore, which affords it unmatched piercing capabilities."
    },
    {
      no: "299",
      name: "FEATHERED SPEAR",
      cn: "羽枪",
      img: "feathered_spear.png",
      got: true,
      meta: ["来源", "Tabantha Frontier"],
      desc: "Its lightweight design is a hallmark of Rito craftsmanship. It's made from light and sturdy materials, which afford Rito warriors ease of use during aerial combat."
    },
    {
      no: "300",
      name: "GERUDO SPEAR",
      cn: "格鲁德长枪",
      img: "gerudo_spear.png",
      got: true,
      meta: ["来源", "Gerudo Desert"],
      desc: "This spear's center of gravity is in its tip, making it a bit unwieldy for the average fighter. But in the hands of a skilled Gerudo warrior, it's a weapon of reliable strength."
    },
    {
      no: "301",
      name: "SERPENTINE SPEAR",
      cn: "蛇形枪",
      img: "serpentine_spear.png",
      got: true,
      meta: ["来源", "East Necluda"],
      desc: "The spearhead of this weapon is uniquely Sheikah in design. Spear masters of the Sheikah tribe can use the crescent shape to snag their opponents and deliver brutal cuts."
    },
    {
      no: "302",
      name: "ANCIENT SPEAR",
      cn: "古代长枪",
      img: "ancient_spear.png",
      got: true,
      desc: "This spear is the result of countless hours of research into the ancient technology used by Guardians. The glowing spearhead has piercing potential."
    },
    {
      no: "303",
      name: "RUSTY HALBERD",
      cn: "锈蚀长枪",
      img: "rusty_halberd.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "A rusty polearm likely used by knights from an age past. The spearhead is in bad shape due to prolonged exposure to the elements, so its durability is low."
    },
    {
      no: "304",
      name: "ROYAL GUARD'S SPEAR",
      cn: "近卫长枪",
      img: "royal_guard's_spear.png",
      got: true,
      desc: "This Sheikah-made spear was created using ancient technology to combat the Calamity. Its attack power is very high, but a critical design flaw left it with poor durability."
    },
    {
      no: "305",
      name: "FLAMESPEAR",
      cn: "火焰枪",
      img: "flamespear.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "A magical spear forged in the magma of Death Mountain. Attack when the blade glows to expel powerful flames."
    },
    {
      no: "306",
      name: "FROSTSPEAR",
      cn: "冰霜枪",
      img: "frostspear.png",
      got: true,
      meta: ["来源", "Hebra Mountains"],
      desc: "A magical spear forged from ancient ice taken from the Hebra Mountains. Attack when the blade glows blue to chill the air and freeze your foe."
    },
    {
      no: "307",
      name: "THUNDERSPEAR",
      cn: "雷电枪",
      img: "thunderspear.png",
      got: true,
      meta: ["来源", "Hyrule Ridge"],
      desc: "A magical spear that contains thunder from Thundra Plateau in its tip. Attack when the blade glows with a golden light to unleash an electric attack."
    },
    {
      no: "308",
      name: "BOKO SPEAR",
      cn: "波克枪",
      img: "boko_spear.png",
      got: true,
      meta: ["来源", "West Necluda"],
      desc: "A spear haphazardly carved from a large tree branch. It looks like its original intent was for skewering meat and cooking it, but it does have some combat merit as well."
    },
    {
      no: "309",
      name: "SPIKED BOKO SPEAR",
      cn: "钉刺波克枪",
      img: "spiked_boko_spear.png",
      got: true,
      meta: ["来源", "Faron Grasslands"],
      desc: "A Boko spear enhanced with sharpened animal bones. It's light, easy to use, and deals a decent amount of damage."
    },
    {
      no: "310",
      name: "DRAGONBONE BOKO SPEAR",
      cn: "龙骨波克枪",
      img: "dragonbone_boko_spear.png",
      got: true,
      meta: ["来源", "Necluda Sea"],
      desc: "This Boko spear has been strengthened with fossilized bones. The bones are positioned outward so the fangs bite at the opponent. Beware Bokoblins carrying this weapon."
    },
    {
      no: "311",
      name: "MOBLIN SPEAR",
      cn: "莫力枪",
      img: "moblin_spear.png",
      got: true,
      meta: ["来源", "Faron Grasslands"],
      desc: "This wooden spear is most often used by Moblins. It's made from a hastily whittled tree, so its stabbing power and durability are both pretty low."
    },
    {
      no: "312",
      name: "SPIKED MOBLIN SPEAR",
      cn: "钉刺莫力枪",
      img: "spiked_moblin_spear.png",
      got: true,
      meta: ["来源", "Gerudo Highlands"],
      desc: "This Moblin-made spear uses a horned animal bone as the spearhead. Like many Moblin weapons it's sloppily made, but this one packs some respective piercing power."
    },
    {
      no: "313",
      name: "DRAGONBONE MOBLIN SPEAR",
      cn: "龙骨莫力枪",
      img: "dragonbone_moblin_spear.png",
      got: true,
      meta: ["来源", "Hebra Mountains"],
      desc: "This spear is a fan favorite among Moblins. The spearhead is made from fossilized bones adorned with spikes, which greatly increases its stabbing power."
    },
    {
      no: "314",
      name: "LIZAL SPEAR",
      cn: "蜥蜴枪",
      img: "lizal_spear.png",
      got: true,
      meta: ["来源", "Lanayru Wetlands"],
      desc: "The brutal, ripping edge of this weapon's spearhead is a distinctly Lizalfos design. Its low durability doesn't lend itself to extended use."
    },
    {
      no: "315",
      name: "ENHANCED LIZAL SPEAR",
      cn: "强化蜥蜴枪",
      img: "enhanced_lizal_spear.png",
      got: true,
      meta: ["来源", "Tabantha Frontier"],
      desc: "Judging by the harpoon-like spearhead of this Lizalfos-made spear, the Lizalfos use it for fishing as well as combat. Try not to get caught on the wrong end of its barbs."
    },
    {
      no: "316",
      name: "FORKED LIZAL SPEAR",
      cn: "双叉蜥蜴枪",
      img: "forked_lizal_spear.png",
      got: true,
      meta: ["来源", "Eldin Canyon"],
      desc: "Skilled Lizalfos warriors tend to favor this spear. What it lacks in piercing power, it makes up for with the brutal wounds its dual ripping blades will inflict."
    },
    {
      no: "317",
      name: "GUARDIAN SPEAR",
      cn: "守护者之枪",
      img: "guardian_spear.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "Wielded by Guardian Scouts, this spear has a high piercing power and is a testament to the Sheikah's high level of technology. The spearhead appears only when brandished."
    },
    {
      no: "318",
      name: "GUARDIAN SPEAR+",
      cn: "守护者之枪+",
      img: "guardian_spear+.png",
      got: true,
      meta: ["来源", "Gerudo Highlands"],
      desc: "The tip of this Guardian spear has been enlarged and strengthened. It's a bit shorter than your average spear, perhaps to facilitate use in tight spaces."
    },
    {
      no: "319",
      name: "GUARDIAN SPEAR++",
      cn: "守护者之枪++",
      img: "guardian_spear++.png",
      got: true,
      meta: ["来源", "Hebra Mountains"],
      desc: "This guardian spear's output has been boosted to the maximum. The spearhead is designed for optimal stabbing, capable of easily piercing most armor."
    },
    {
      no: "320",
      name: "LYNEL SPEAR",
      cn: "莱尼尔之枪",
      img: "lynel_spear.png",
      got: true,
      meta: ["来源", "Gerudo Highlands"],
      desc: "The crescent-shaped spearhead of this Lynel-made weapon gives it poor balance, making it difficult to wield. Lynels, however, can swing it effectively with one hand."
    },
    {
      no: "321",
      name: "MIGHTY LYNEL SPEAR",
      cn: "强壮莱尼尔之枪",
      img: "mighty_lynel_spear.png",
      got: true,
      meta: ["来源", "Great Hyrule Forest"],
      desc: "The weight and cutting edge of this Lynel-made spear have both been enhanced. It's immensely heavy for a Hylian, but a Lynel can cleave through rock with a single swing."
    },
    {
      no: "322",
      name: "SAVAGE LYNEL SPEAR",
      cn: "凶暴莱尼尔之枪",
      img: "savage_lynel_spear.png",
      got: true,
      meta: ["来源", "Gerudo Highlands"],
      desc: "White-haired Lynels favor this brutal spear. Its axe-like spearhead and exceptional weight give it absolute destructive power."
    },
    {
      no: "323",
      name: "BOW OF LIGHT",
      cn: "光之弓",
      img: "bow_of_light.png",
      got: true,
      desc: "Princess Zelda gave you this bow and arrow for the battle with Dark Beast Ganon. When wielded by the hero, it fires arrows of pure light strong enough to oppose the Calamity."
    },
    {
      no: "324",
      name: "WOODEN BOW",
      cn: "木弓",
      img: "wooden_bow.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "This wooden bow may not be the most reliable for battling monsters, but is excellent for hunting small animals."
    },
    {
      no: "325",
      name: "TRAVELER'S BOW",
      cn: "旅人之弓",
      img: "traveler's_bow.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "A small bow used by travelers for protection. It doesn't do a lot of damage, but it can be used to attack foes from a distance."
    },
    {
      no: "326",
      name: "SOLDIER'S BOW",
      cn: "士兵之弓",
      img: "soldier's_bow.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "A bow designed for armed conflict. Inflicts more damage than a civilian bow, but it will still burn if it touches fire."
    },
    {
      no: "327",
      name: "KNIGHT'S BOW",
      cn: "骑士之弓",
      img: "knight's_bow.png",
      got: true,
      meta: ["来源", "Gerudo Desert"],
      desc: "The sturdy metal construction of this bow offers superior durability, while its lack of firing quirks makes it quite reliable. Once favored by the knights at Hyrule Castle."
    },
    {
      no: "328",
      name: "ROYAL BOW",
      cn: "王族之弓",
      img: "royal_bow.png",
      got: true,
      meta: ["来源", "Tabantha Frontier"],
      desc: "In the past, the king of Hyrule presented this bow to only the most talented archers in the land. Its combat capabilities are as impressive as its extravagant design."
    },
    {
      no: "329",
      name: "FOREST DWELLER'S BOW",
      cn: "森林居民的弓",
      img: "forest_dweller's_bow.png",
      got: true,
      meta: ["来源", "Tabantha Frontier"],
      desc: "The Koroks made this bow for Hylians. It's crafted from flexible wood and uses sturdy vines for the bowstring. Its construction may be simple, but it fires multiple arrows at once."
    },
    {
      no: "330",
      name: "SILVER BOW",
      cn: "白银弓",
      img: "silver_bow.png",
      got: true,
      meta: ["来源", "Lanayru Great Spring"],
      desc: "A bow favored by the Zora for fishing. It doesn't boast the highest firepower, but the special metal it's crafted from prioritizes durability."
    },
    {
      no: "331",
      name: "SWALLOW BOW",
      cn: "燕之弓",
      img: "swallow_bow.png",
      got: true,
      meta: ["来源", "Tabantha Frontier"],
      desc: "This bow is a favorite among Rito warriors. The bowstring has been specially engineered for aerial combat, which allows it to be drawn faster than a normal bow."
    },
    {
      no: "332",
      name: "FALCON BOW",
      cn: "隼之弓",
      img: "falcon_bow.png",
      got: true,
      meta: ["来源", "Tabantha Frontier"],
      desc: "A highly refined Rito-made bow created by a master Rito craftsman. Rito warriors favor it for its superior rate of fire, which helps them excel even further at aerial combat."
    },
    {
      no: "333",
      name: "GREAT EAGLE BOW",
      cn: "大鹫弓",
      img: "great_eagle_bow.png",
      got: true,
      meta: ["来源", "Tabantha Frontier"],
      desc: "A bow without equal wielded by the Rito Champion, Revali. It's said that Revali could loose arrows with the speed of a gale, making him supreme in aerial combat."
    },
    {
      no: "334",
      name: "GOLDEN BOW",
      cn: "黄金弓",
      img: "golden_bow.png",
      got: true,
      meta: ["来源", "Gerudo Highlands"],
      desc: "This Gerudo-made bow is popular for the fine ornamentations along its limbs. Designed for hunting and warfare alike, this bow was engineered to strike distant targets."
    },
    {
      no: "335",
      name: "PHRENIC BOW",
      cn: "神秘弓",
      img: "phrenic_bow.png",
      got: true,
      meta: ["来源", "West Necluda"],
      desc: "A bow passed down through the Sheikah tribe. Concentrating before drawing the string will allow you to target distant enemies as easily as those nearby."
    },
    {
      no: "336",
      name: "ANCIENT BOW",
      cn: "古代弓",
      img: "ancient_bow.png",
      got: true,
      desc: "This bow is the result of Robbie's research. Ancient Sheikah technology affords it heightened functionality. Arrows fired from it travel in a perfectly straight line."
    },
    {
      no: "337",
      name: "ROYAL GUARD'S BOW",
      cn: "近卫之弓",
      img: "royal_guard's_bow.png",
      got: true,
      desc: "This prototype Sheikah-made bow was designed to fight the Great Calamity. Made with ancient technology, it boast a high rate of fire and firepower, but has a low durability."
    },
    {
      no: "338",
      name: "BOKO BOW",
      cn: "波克弓",
      img: "boko_bow.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "A basic Bokoblin bow made from wood. It's made by taking any tree branch and just tying a string to either end, so don't expect much in the way of combat effectiveness."
    },
    {
      no: "339",
      name: "SPIKED BOKO BOW",
      cn: "钉刺波克弓",
      img: "spiked_boko_bow.png",
      got: true,
      meta: ["来源", "Faron Grasslands"],
      desc: "An upgraded Boko bow bound with animal bone to boost its durability and firepower. Its craftsmanship is sloppy, but it's light and easy to use."
    },
    {
      no: "340",
      name: "DRAGON BONE BOKO BOW",
      cn: "龙骨波克弓",
      img: "dragon_bone_boko_bow.png",
      got: true,
      meta: ["来源", "Hyrule Ridge"],
      desc: "A Boko bow reinforced by fossils. Bokoblins handpicked the materials it's made from, so it boasts a respectable firepower."
    },
    {
      no: "341",
      name: "LIZAL BOW",
      cn: "蜥蜴弓",
      img: "lizal_bow.png",
      got: true,
      meta: ["来源", "Lanayru Great Spring"],
      desc: "A wooden bow created by Lizalfos. It's reinforced by the bones of a large fish - a marked improvement over any standard wooden bow."
    },
    {
      no: "342",
      name: "STRENGTHENED LIZAL BOW",
      cn: "强化蜥蜴弓",
      img: "strengthened_lizal_bow.png",
      got: true,
      meta: ["来源", "Tabantha Frontier"],
      desc: "A Lizal bow with a grip reinforced by metal. The body is made from the branches of a flexible tree that grows near water, which offers some serious destructive power."
    },
    {
      no: "343",
      name: "STEEL LIZAL BOW",
      cn: "钢铁蜥蜴弓",
      img: "steel_lizal_bow.png",
      got: true,
      meta: ["来源", "Hebra Mountains"],
      desc: "This bow is wielded by Lizalfos who are expert marksmen. The metal that reinforces much of the weapon adds some additional weight but offers heightened durability."
    },
    {
      no: "344",
      name: "LYNEL BOW",
      cn: "莱尼尔之弓",
      img: "lynel_bow.png",
      got: true,
      meta: ["来源", "Gerudo Highlands"],
      desc: "A Lynel-made bow crafted from rough metal. True to the vicious nature of Lynel weaponry, it fires a spread of multiple arrows at once. Ideal for taking down quick-moving targets."
    },
    {
      no: "345",
      name: "MIGHTY LYNEL BOW",
      cn: "强壮莱尼尔之弓",
      img: "mighty_lynel_bow.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "This massive Lynel bow sports a bowstring made from a metal so tough, mere Hylians have trouble drawing it back."
    },
    {
      no: "346",
      name: "SAVAGE LYNEL BOW",
      cn: "凶暴莱尼尔之弓",
      img: "savage_lynel_bow.png",
      got: true,
      meta: ["来源", "Hebra Mountains"],
      desc: "This Lynel bow is made from a special steel found at the peak of Death Mountain. It has tremendous stopping power and can pierce think armor as easily as thin paper."
    },
    {
      no: "347",
      name: "DUPLEX BOW",
      cn: "双联弓",
      img: "duplex_bow.png",
      got: true,
      meta: ["来源", "Gerudo Highlands"],
      desc: "A bow favored by the skilled archers of the Yiga Clan. It's been engineered to fire two arrows at once to ensure your target comes to a swift a none-two-pleasant halt."
    },
    {
      no: "348",
      name: "ARROW",
      cn: "箭",
      img: "arrow.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "A common arrow. Its shaft was carved from the wood of a sturdy tree."
    },
    {
      no: "349",
      name: "FIRE ARROW",
      cn: "火箭",
      img: "fire_arrow.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "An arrow imbued with the power of fire. It breaks apart on impact, igniting objects in the immediate area. It's incredibly effective against cold things."
    },
    {
      no: "350",
      name: "ICE ARROW",
      cn: "冰箭",
      img: "ice_arrow.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "An arrow imbued with the power of ice. It breaks apart on impact, freezing objects in the immediate area. It's incredibly effective against hot things."
    },
    {
      no: "351",
      name: "SHOCK ARROW",
      cn: "电箭",
      img: "shock_arrow.png",
      got: true,
      meta: ["来源", "Lanayru Great Spring"],
      desc: "An arrow imbued with the power of electricity. It breaks apart on impact, channeling electricity into nearby objects. It's incredibly effective against metal or anything wet."
    },
    {
      no: "352",
      name: "BOMB ARROW",
      cn: "炸弹箭",
      img: "bomb_arrow.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "A powerful arrow designed to destroy monsters. The explosive powder packed into the tip ignites on impact, dealing massive damage to anything caught in the blast."
    },
    {
      no: "353",
      name: "ANCIENT ARROW",
      cn: "古代箭",
      img: "ancient_arrow.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "An arrow created using ancient technology. To be struck with one is to be consigned to oblivion in an instant. It deals devastating damage—even against Guardians."
    },
    {
      no: "354",
      name: "HYLIAN SHIELD",
      cn: "海利亚盾",
      img: "hylian_shield.png",
      got: true,
      desc: "A shield passes down through the Hylian royal family, along with the legend of the hero who wielded it. Its defensive capabilities and durability outshine all other shields."
    },
    {
      no: "355",
      name: "POT LID",
      cn: "锅盖",
      img: "pot_lid.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "The lid of a large soup pot. It smells vaguely of poultry broth... Yum! It can take quite a beating before breaking."
    },
    {
      no: "356",
      name: "WOODEN SHIELD",
      cn: "木盾",
      img: "wooden_shield.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "This lightweight, simple shield is ideal for less-experienced fighters. It can withstand light attacks, but blocking stronger blows is not recommended."
    },
    {
      no: "357",
      name: "EMBLAZONED SHIELD",
      cn: "纹章盾",
      img: "emblazoned_shield.png",
      got: true,
      meta: ["来源", "East Necluda"],
      desc: "This shield features a traditional design from Necluda. Its combat capabilities aren't much better than the standard wooden shield, but it found popularity for its design."
    },
    {
      no: "358",
      name: "HUNTER'S SHIELD",
      cn: "猎人盾",
      img: "hunter's_shield.png",
      got: true,
      meta: ["来源", "Hebra Mountains"],
      desc: "Favored by hunters for its rabbit design, which is said to bring luck on hunts. It's easy to use, but its durability leaves something to be desired."
    },
    {
      no: "359",
      name: "FISHERMAN'S SHIELD",
      cn: "渔夫盾",
      img: "fisherman's_shield.png",
      got: true,
      meta: ["来源", "East Necluda"],
      desc: "Often carried by fishermen for its fish design, which represents hope for a good catch. Its light wooden construction makes it convenient to take on a boat."
    },
    {
      no: "360",
      name: "TRAVELER'S SHIELD",
      cn: "旅人盾",
      img: "traveler's_shield.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "A sturdy shield loved by many an adventurer. It is made of animal hide and sturdy wood and is best suited to defending against weak monsters or animals."
    },
    {
      no: "361",
      name: "SOLDIER'S SHIELD",
      cn: "士兵盾",
      img: "soldier's_shield.png",
      got: true,
      meta: ["来源", "Tabantha Frontier"],
      desc: "A shield once used by the guards of Hyrule Castle. It's easy to handle, but its core is made of wood, so it can catch fire."
    },
    {
      no: "362",
      name: "KNIGHT'S SHIELD",
      cn: "骑士盾",
      img: "knight's_shield.png",
      got: true,
      meta: ["来源", "Hebra Mountains"],
      desc: "A shield favored by the knights who served the Hyrulean royal family. Its sturdy metal construction makes it quite durable, but its weight requires decent skill to wield."
    },
    {
      no: "363",
      name: "ROYAL SHIELD",
      cn: "王族盾",
      img: "royal_shield.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "A shield issued to the Hyrulean royal family's immediate guard detail. It boasts a high defense, but these days it's more a collector's item due to its ornamentation."
    },
    {
      no: "364",
      name: "FOREST DWELLER'S SHIELD",
      cn: "森林居民的盾",
      img: "forest_dweller's_shield.png",
      got: true,
      meta: ["来源", "Great Hyrule Forest"],
      desc: "The Koroks made this shield specifically for Hylians. It's made from the finest hard wood of trees that only grow in the Korok forest, so it's sturdier than it looks."
    },
    {
      no: "365",
      name: "SILVER SHIELD",
      cn: "白银盾",
      img: "silver_shield.png",
      got: true,
      meta: ["来源", "Lanayru Great Spring"],
      desc: "A Zora-made shield adorned with intricate ornamentation. It's said that true masters of this shield can redirect attacks as a rock redirects rushing water."
    },
    {
      no: "366",
      name: "KITE SHIELD",
      cn: "风筝盾",
      img: "kite_shield.png",
      got: true,
      meta: ["来源", "Hebra Mountains"],
      desc: "Rito warriors cherish this shield. Its unique shape is designed with mid-battle flight in mind to facilitate aerial combat."
    },
    {
      no: "367",
      name: "GERUDO SHIELD",
      cn: "格鲁德盾",
      img: "gerudo_shield.png",
      got: true,
      meta: ["来源", "Gerudo Desert"],
      desc: "The design of this metal shield has changed over time to match the Gerudo's sword-and-shield fighting style. It's favored by soldiers and travelers alike."
    },
    {
      no: "368",
      name: "RADIANT SHIELD",
      cn: "光辉盾",
      img: "radiant_shield.png",
      got: true,
      meta: ["来源", "Gerudo Desert"],
      desc: "This extravagant shield is presented to Gerudo warriors who rise to the rank of captain. Its apparent opulence is rivaled only by its combat capabilities."
    },
    {
      no: "369",
      name: "DAYBREAKER",
      cn: "破晓之盾",
      img: "daybreaker.png",
      got: true,
      meta: ["来源", "Gerudo Desert"],
      desc: "This shield was cherished by the Gerudo Champion Urbosa. The gold used to make it was handpicked to ensure a design that is both lightweight and very durable."
    },
    {
      no: "370",
      name: "SHIELD OF THE MIND'S EYE",
      cn: "心眼之盾",
      img: "shield_of_the_mind's_eye.png",
      got: true,
      meta: ["来源", "West Necluda"],
      desc: "A small Sheikah-made shield. Its design is intended to decrease blind spots without sacrificing too much defense."
    },
    {
      no: "371",
      name: "ANCIENT SHIELD",
      cn: "古代盾",
      img: "ancient_shield.png",
      got: true,
      desc: "This shield was made using ancient Sheikah technology. Its surface glows blue when raised in defense. Enhanced functionality allows it to deflect Guardian beams."
    },
    {
      no: "372",
      name: "RUSTY SHIELD",
      cn: "锈蚀盾",
      img: "rusty_shield.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "It's likely that this rusty old shield once belonged to a knight. It still has some defensive capabilities, but its usefulness has been worn down by time."
    },
    {
      no: "373",
      name: "ROYAL GUARD'S SHIELD",
      cn: "近卫盾",
      img: "royal_guard's_shield.png",
      got: true,
      desc: "This shield was forged using ancient Sheikah technology. It boasts extremely high stopping power, but its structural weakness made its low durability impractical for combat."
    },
    {
      no: "374",
      name: "BOKO SHIELD",
      cn: "波克盾",
      img: "boko_shield.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "A Bokoblin-made shield created by attaching a handhold to any flat tree bark picked up off the ground. It's pretty shoddy, so don't expect it to last very long."
    },
    {
      no: "375",
      name: "SPIKED BOKO SHIELD",
      cn: "钉刺波克盾",
      img: "spiked_boko_shield.png",
      got: true,
      meta: ["来源", "Faron Grasslands"],
      desc: "A Boko shield made of slightly stronger wood and reinforced with animal bones."
    },
    {
      no: "376",
      name: "DRAGONBONE BOKO SHIELD",
      cn: "龙骨波克盾",
      img: "dragonbone_boko_shield.png",
      got: true,
      meta: ["来源", "Hyrule Ridge"],
      desc: "This Boko shield is reinforced with fossilized bone. Its defensive capabilities are respectable, but its predictably slipshod craftsmanship spells low durability."
    },
    {
      no: "377",
      name: "LIZAL SHIELD",
      cn: "蜥蜴盾",
      img: "lizal_shield.png",
      got: true,
      meta: ["来源", "Lake Hylia"],
      desc: "A common shield found among the Lizalfos. It's made of metal, but its sloppy craftsmanship offers poor durability."
    },
    {
      no: "378",
      name: "REINFORCED LIZAL SHIELD",
      cn: "强化蜥蜴盾",
      img: "reinforced_lizal_shield.png",
      got: true,
      meta: ["来源", "Tabantha Frontier"],
      desc: "This Lizal shield has been strengthened by adding a different type of metal to the mix. The edge is lined with spikes, so handle with care."
    },
    {
      no: "379",
      name: "STEEL LIZAL SHIELD",
      cn: "钢铁蜥蜴盾",
      img: "steel_lizal_shield.png",
      got: true,
      meta: ["来源", "Hebra Mountains"],
      desc: "This Lizal shield is adorned with several metal shells as a means of reinforcement. Its defensive capabilities are high, but its weight requires a skilled soldier to bear."
    },
    {
      no: "380",
      name: "GUARDIAN SHIELD",
      cn: "守护者之盾",
      img: "guardian_shield.png",
      got: true,
      meta: ["来源", "West Necluda"],
      desc: "A shield made with ancient Sheikah technology. It can deflect a Guardian Scout's beam."
    },
    {
      no: "381",
      name: "GUARDIAN SHIELD+",
      cn: "守护者之盾+",
      img: "guardian_shield+.png",
      got: true,
      meta: ["来源", "East Necluda"],
      desc: "This larger version of a Guardian shield has had its output level boosted. Its defensive capabilities are comparable to those of a metal shield's."
    },
    {
      no: "382",
      name: "GUARDIAN SHIELD++",
      cn: "守护者之盾++",
      img: "guardian_shield++.png",
      got: true,
      meta: ["来源", "Gerudo Highlands"],
      desc: "The output level of this shield has been boosted to a maximum. Its combat capabilities surpass those of metallic shields, and it can deflect Guardian Scout beams."
    },
    {
      no: "383",
      name: "LYNEL SHIELD",
      cn: "莱尼尔之盾",
      img: "lynel_shield.png",
      got: true,
      meta: ["来源", "Lanayru Great Spring"],
      desc: "A sturdy shield favored by Lynels for its defensive and offensive capabilities. First and foremost a shield, but the bladed edges can deal slashing attacks when deflecting."
    },
    {
      no: "384",
      name: "MIGHTY LYNEL SHIELD",
      cn: "强壮莱尼尔之盾",
      img: "mighty_lynel_shield.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "This Lynel-made shield has been reinforced with armor and even more blades. Stronger in both defense and offense, it can tear through basic armor when deflecting."
    },
    {
      no: "385",
      name: "SAVAGE LYNEL SHIELD",
      cn: "凶暴莱尼尔之盾",
      img: "savage_lynel_shield.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "This ultimate Lynel shield is used only by the white-haired Lynels. It excels at defending against even the most brutal of attacks and cutting down powerful foes when deflecting."
    }
  ],
  treasures: [
    {
      no: "386",
      name: "TREASURE CHEST",
      cn: "宝箱",
      img: "treasure_chest.png",
      got: true,
      meta: ["发现", "Greater Hyrule"],
      desc: "Fortunes untold (potentially) await the lucky adventurer who finds one of these. Chests can often be found within shrines or at enemy camps, but there may be some crafty folks who think they're safer underground."
    },
    {
      no: "387",
      name: "ORE DEPOSIT",
      cn: "矿脉",
      img: "ore_deposit.png",
      got: true,
      meta: ["发现", "Greater Hyrule"],
      desc: "This deposit contains a good deal of ore. Breaking the rock will yield rock salt, flint, and other minerals of varying value."
    },
    {
      no: "388",
      name: "RARE ORE DEPOSIT",
      cn: "稀有矿脉",
      img: "rare_ore_deposit.png",
      got: true,
      meta: ["发现", "Greater Hyrule"],
      desc: "This deposit contains a good deal of precious ore and the occasional rare mineral, like ruby and sapphire. Break it open to see what it has to offer!"
    },
    {
      no: "389",
      name: "LUMINOUS ORE DEPOSIT",
      cn: "夜光矿脉",
      img: "luminous_ore_deposit.png",
      got: true,
      meta: ["发现", "Greater Hyrule"],
      desc: "This deposit contains quite a bit of luminous stone. Crack it open to get at the easily process rocks within."
    }
  ],
};