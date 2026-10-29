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
      desc: "These can most often be found on plains. Their usefulness as transportation has made them valuable since ancient times. That said, wild horses do tend to get spooked and run off when approached, so if you're looking to snag one, it's best to sneak up on it.",
      cn_desc: "马在平原上最为常见。自远古时代起,它们就是重要的交通工具,因此一直备受珍视。不过野生马匹一旦察觉有人靠近,往往会受惊逃跑,想抓住一匹的话,最好悄悄接近。"
    },
    {
      no: "002",
      name: "GIANT HORSE",
      cn: "巨马",
      img: "giant_horse.png",
      got: true,
      desc: "This giant horse is the last of its kind. Its physical capabilities completely overshadow those of regular horses, but its temperament is extremely wild. Only a truly skilled rider can train, or even catch, this beast of a mount. This is a horse that chooses its rider.",
      cn_desc: "这种巨马是同类中最后的幸存者。它的体能完全超越普通马匹,但性情极其狂野。只有技艺高超的骑手才能驯服,甚至捕获这匹猛兽坐骑。这是一匹会挑选主人的马。"
    },
    {
      no: "003",
      name: "WHITE HORSE",
      cn: "白马",
      img: "white_horse.png",
      got: true,
      desc: "The Hyrulean royal family that perished 100 years ago would sometimes ride atop white horses as a display of their divine right. This white horse may be a descendant of one once ridden by royalty.",
      cn_desc: "百年前灭亡的海拉鲁王族,有时会骑着白马巡游,以彰显其神授王权。这匹白马或许是昔日王族坐骑的后代。"
    },
    {
      no: "004",
      name: "LORD OF THE MOUNTAIN",
      cn: "山之霸主",
      img: "lord_of_the_mountain.png",
      got: true,
      meta: ["栖息地", "Satori Mountain"],
      desc: "This noble creature watches over all animals that make their homes in the forest. Legends say this holy creature is a reincarnation of a sage that died on the lands it now protects. It has an acute awareness of its surroundings, so it seldom appears before people. It's sometimes known by its other name, Satori",
      cn_desc: "这种高贵的生物守护着森林中所有的动物。传说这匹圣兽是死于这片土地的贤者的转世。它对周围环境极为敏锐,因此很少在人前现身。它有时也被称作萨托利。"
    },
    {
      no: "005",
      name: "STALHORSE",
      cn: "骷髅马",
      img: "stalhorse.png",
      got: true,
      meta: ["栖息地", "Hebra Mountains"],
      desc: "This skeletal horse is ridden by monsters. It was once a regular horse, but Ganon's power revived it from death. It cannot maintain its bone structure in the daytime.",
      cn_desc: "这种骷髅马是怪物的坐骑。它原本是一匹普通的马,是盖侬的力量让它从死亡中复苏。白天时它无法维持骨骼结构。"
    },
    {
      no: "006",
      name: "DONKEY",
      cn: "驴",
      img: "donkey.png",
      got: true,
      meta: ["栖息地", "Greater Hyrule"],
      desc: "Smaller than horses, these are raised as livestock in the countryside, so they don't exist in the wild. They're more powerful than they look and specialize in transporting baggage. This has made them popular with traveling merchants.",
      cn_desc: "驴比马小,是乡村饲养的家畜,因此在野外并不存在。它们比看上去更健壮,擅长驮运行李,因此深受行商们的喜爱。"
    },
    {
      no: "007",
      name: "SAND SEAL",
      cn: "沙海象",
      img: "sand_seal.png",
      got: true,
      meta: ["栖息地", "Gerudo Desert"],
      desc: "These seals use their large flippers to move through the sand as if swimming. They were once wild animals but have since been domesticated by the Gerudo. They rely on their excellent hearing to find their way while riding submerged in the sand.Their large, distinct tusks look pretty ferocious, but their favorite food is actually fruit.",
      cn_desc: "这种海象用巨大的鳍在沙中如游泳般移动。它们曾是野生动物,后来被格鲁德族驯化。在沙中潜行时,它们依靠敏锐的听觉寻找方向。它们巨大而醒目的獠牙看似凶猛,但其实最喜欢吃水果。"
    },
    {
      no: "008",
      name: "PATRICIA",
      cn: "帕特丽夏",
      img: "patricia.png",
      got: true,
      meta: ["栖息地", "Gerudo Desert"],
      desc: "This is Riju's own sand seal. It may look intense, but she dotes on it regularly; the ribbon it wears was a gift form her, and it even has its own pen in Gerudo Town. It's far more agile than any other sand seal and far more outgoing. An ever-reliable partner to Riju, Patricia is always ready to take off through the desert at a moment's notice.",
      cn_desc: "这是璐菊的专属沙海象。它看起来气势汹汹,但璐菊时常宠爱它;它头上的缎带是璐菊的礼物,在格鲁德小镇里它甚至有自己专属的圈栏。它比其他沙海象更敏捷、更外向。作为璐菊可靠的伙伴,帕特丽夏随时准备带她驰骋沙漠。"
    },
    {
      no: "009",
      name: "BUSHY-TAILED SQUIRREL",
      cn: "蓬尾松鼠",
      img: "bushy-tailed_squirrel.png",
      got: true,
      meta: ["栖息地", "Hyrule Field"],
      desc: "These small creatures are known for their large tails. They tend to live in forests and subsist on acorns and other nuts. They carry their food in their mouths but will sometimes drop it when surprised in an adorable display of shock.",
      cn_desc: "这种小动物以大尾巴而闻名。它们多栖息于森林,以橡果等坚果为食。它们用嘴搬运食物,受惊时会可爱地把食物掉在地上。"
    },
    {
      no: "010",
      name: "WOODLAND BOAR",
      cn: "森林野猪",
      img: "woodland_boar.png",
      got: true,
      meta: ["栖息地", "Hyrule Field"],
      desc: "These medium-sized beasts can be found all throughout Hyrule. you can most often find them foraging for food in forests or meadows. Although usually docile, they won't hesitate to charge you full force if you get too close.",
      cn_desc: "这种中型野兽遍布海拉鲁各地。最常见的是它们在森林或草地觅食。虽然平时性情温顺,但若靠得太近,它们会毫不犹豫地全力冲撞。"
    },
    {
      no: "011",
      name: "RED-TUSKED BOAR",
      cn: "红牙野猪",
      img: "red-tusked_boar.png",
      got: true,
      meta: ["栖息地", "Akkala Highlands"],
      desc: "These boars are known for their red tusks and black fur. They're similar to your average boars but are considerably stronger. Extra caution is advised when hunting these.",
      cn_desc: "这种野猪以红色的獠牙和黑色的毛发著称。它们与普通野猪相似,但强壮得多。狩猎时务必格外小心。"
    },
    {
      no: "012",
      name: "MOUNTAIN GOAT",
      cn: "山地山羊",
      img: "mountain_goat.png",
      got: true,
      meta: ["栖息地", "Hyrule Ridge"],
      desc: "These herbivores make their home in meadows and rocky areas. Their characteristically strong legs and hooves facilitate easy climbing over rocks. Goats aren't very quick, so they make good targets for beginning hunters.",
      cn_desc: "这种草食动物栖息于草地和岩石地带。它们强健的腿和蹄子使它们能轻松攀爬岩石。山羊动作不快,是新手猎人练手的好目标。"
    },
    {
      no: "013",
      name: "WHITE GOAT",
      cn: "白山羊",
      img: "white_goat.png",
      got: true,
      meta: ["栖息地", "West Necluda"],
      desc: "These goats are raised for their multiple uses. Their milk can be drank or made into butter, and their soft fur is used to make clothes. Domesticated goats wear bells around their necks so they can easily be found after being let out to graze.",
      cn_desc: "这种山羊作为多用途家畜饲养。它们的奶可以饮用或制成黄油,柔软的毛皮则用来制作衣物。家养山羊脖子上挂着铃铛,放牧后容易找到。"
    },
    {
      no: "014",
      name: "MOUNTAIN BUCK",
      cn: "山地鹿(雄)",
      img: "mountain_buck.png",
      got: true,
      meta: ["栖息地", "Hyrule Field"],
      desc: "These male deer are usually found deep in the forest. They're well known for their huge, branching antlers, which they'll swing in self-defense if threatened. Deer are cautious by nature so it can be tricky getting close, but if you can capture one, you may be able to take it for a ride.",
      cn_desc: "这种雄鹿通常在森林深处出没。它们以巨大的分叉鹿角闻名,受到威胁时会摆动鹿角自卫。鹿天性谨慎,很难接近,但若能捕获一匹,或许可以骑着它跑上一段。"
    },
    {
      no: "015",
      name: "MOUNTAIN DOE",
      cn: "山地鹿(雌)",
      img: "mountain_doe.png",
      got: true,
      meta: ["栖息地", "Hyrule Field"],
      desc: "These female deer are often found alongside a male. They're very timid animals by nature, but they tend to let their guard down when eating apples, a favorite food. This tidbit of information can be useful to hunters.",
      cn_desc: "这种雌鹿常与雄鹿相伴出没。它们天性胆小,但吃苹果这种喜爱的食物时会放松警惕。这一习性对猎人很有用。"
    },
    {
      no: "016",
      name: "WATER BUFFALO",
      cn: "水牛",
      img: "water_buffalo.png",
      got: true,
      meta: ["栖息地", "Lanayru Wetlands"],
      desc: "These wild cows come equipped with big, strong horns. They live off grass that grows near the waterfront. Their meat is considered to be high quality, so they're a common target among hunters. Fun Fact: the domesticated Hateno cow, often raised in villages, was bred through selective breeding using these.",
      cn_desc: "这种野牛长着又大又结实的角。它们以水边生长的草为食。它们的肉被视为上等品,是猎人们的常见目标。有趣的是:哈特诺村饲养的家牛,就是利用它们进行选择性育种培育出来的。"
    },
    {
      no: "017",
      name: "HATENO COW",
      cn: "哈特诺奶牛",
      img: "hateno_cow.png",
      got: true,
      meta: ["栖息地", "East Necluda"],
      desc: "Originating in Hateno Village, these cows are kept as livestock primarily for their milk. Their horns are smaller than a water buffalo's, and they're much more docile and therefore easier to raise. Their horns are decorated with bright colors when taken out to pasture.",
      cn_desc: "原产于哈特诺村的牛,主要作为家畜饲养以获取牛奶。它们的角比水牛小,性情温顺得多,更容易饲养。放牧时,它们的角会装饰上鲜艳的颜色。"
    },
    {
      no: "018",
      name: "HIGHLAND SHEEP",
      cn: "高地绵羊",
      img: "highland_sheep.png",
      got: true,
      meta: ["栖息地", "East Necluda"],
      desc: "Originally native to the mountainous regions, these sheep were domesticated for their wool and have since found a home in villages. Once the fluffy wool grows out, it's harvested and used to make clothing and bedding. They're calm, timid creatures and move about in small herds.",
      cn_desc: "这种羊原本栖息于高山地区,因羊毛而被驯化,如今在村庄里安家。蓬松的羊毛长成后会被收割,用来制作衣物和寝具。它们是温顺胆小的生物,以小群活动。"
    },
    {
      no: "019",
      name: "GRASSLAND FOX",
      cn: "草原狐",
      img: "grassland_fox.png",
      got: true,
      meta: ["栖息地", "Hyrule Field"],
      desc: "This breed of fox is common to grasslands and forests and is hallmarked by its fluffy, white-tipped tail. Unlike other foxes, they tend to act independently rather than form packs. Being omnivores, they hunt animals smaller than themselves and often stick to eating fruit and insects.",
      cn_desc: "这种狐狸常见于草原和森林,以蓬松的白尾尖为标志。与其他狐狸不同,它们倾向于独来独往而非成群结队。作为杂食动物,它们捕食比自己小的动物,也常以果实和昆虫为食。"
    },
    {
      no: "020",
      name: "SNOWCOAT FOX",
      cn: "雪地狐",
      img: "snowcoat_fox.png",
      got: true,
      meta: ["栖息地", "Hebra Mountains"],
      desc: "This particular breed of grassland fox makes its home in cold climates such as the Tabantha region. Its fur turned white as a means of adapting to snowy weather, serving as natural camouflage. Because of this, spotting one in the snow takes a keen eye.",
      cn_desc: "这种草原狐的变种栖息于塔班萨等寒冷地区。为了适应雪天,它们的毛变成了白色,作为天然的保护色。正因如此,要在雪地里发现它们需要敏锐的眼力。"
    },
    {
      no: "021",
      name: "MARAUDO WOLF",
      cn: "玛拉乌德狼",
      img: "maraudo_wolf.png",
      got: true,
      meta: ["栖息地", "Tabantha Frontier"],
      desc: "These wolves are not only carnivorous but can also be downright fierce. They're highly aggressive and aren't afraid to attack people. They hunt in groups and surround their prey as a means of bringing it down. That said, if one of their own is injured, the rest are wise enough to run away. They communicate via howls, so if you're wandering the forest and hear their call, you had best take care.",
      cn_desc: "这种狼不仅食肉,而且相当凶猛。它们攻击性极强,不怕袭击人类。它们成群捕猎,围住猎物将其制服。不过如果同伴受伤,它们会明智地四散逃跑。它们用嚎叫交流,若在森林中听到它们的叫声,最好小心行事。"
    },
    {
      no: "022",
      name: "WASTELAND COYOTE",
      cn: "荒地郊狼",
      img: "wasteland_coyote.png",
      got: true,
      meta: ["栖息地", "Gerudo Desert"],
      desc: "This contentious beast is native to the Gerudo region. It makes its home in the desert, so it doesn't have a problem with hot, arid climates. They do hunt other beasts and small animals but more often turn their sights on people. They're a threat to anyone traveling through the desert.",
      cn_desc: "这种好斗的野兽原产于格鲁德地区。它栖息于沙漠,因此不怕炎热干燥的气候。它们会捕猎其他野兽和小动物,但更常把目光投向人类。对穿越沙漠的旅人来说,它们是威胁。"
    },
    {
      no: "023",
      name: "COLD-FOOTED WOLF",
      cn: "冷足狼",
      img: "cold-footed_wolf.png",
      got: true,
      meta: ["栖息地", "Hebra Mountains"],
      desc: "This breed of maraudo wolf lives in snowy, mountainous areas, such as the Hebra Mountains. They travel in packs similar to their maraudo relatives but are considerably tougher thanks to having adapted to their harsh environment. They're made even more dangerous by their white fur, which provides a natural camouflage in the snow.",
      cn_desc: "这种玛拉乌德狼的变种生活在海布拉山脉等雪山地区。它们与玛拉乌德狼一样成群活动,但由于适应了严酷的环境,战斗力强得多。它们白色的毛皮提供了天然的雪地伪装,使其更加危险。"
    },
    {
      no: "024",
      name: "TABANTHA MOOSE",
      cn: "塔班萨麋鹿",
      img: "tabantha_moose.png",
      got: true,
      meta: ["栖息地", "Hebra Mountains"],
      desc: "The largest breed of deer in Hyrule, this mammal's origin was traced back to the Tabantha region. It's easily distinguished by its immense antlers, which these moose shed and regrow yearly. Their meat is tender and high quality, so it works well in a stew.",
      cn_desc: "海拉鲁体型最大的鹿科动物,起源可追溯到塔班萨地区。它们以巨大的鹿角而易于辨认,这种麋鹿每年都会脱落并重新长出鹿角。它们的肉鲜嫩且品质上乘,非常适合炖煮。"
    },
    {
      no: "025",
      name: "GREAT-HORNED RHINOCEROS",
      cn: "大角犀牛",
      img: "great-horned_rhinoceros.png",
      got: true,
      meta: ["栖息地", "Hebra Mountains"],
      desc: "This animal's horn is a whopping half the size of its body. Although originally members of arid-region rhinoceroses, these migrated to colder climates and adapted to live in snowy mountains. Their hides are particularly thick, and their horns can cause some serious damage, so only experienced hunters should track these.",
      cn_desc: "这种动物的角足足有身体一半大小。它们原本属于干旱地区的犀牛,后来迁徙到寒冷地带,适应了雪山生活。它们的皮特别厚,角能造成严重伤害,只有经验丰富的猎人才应追踪它们。"
    },
    {
      no: "026",
      name: "HONEYVORE BEAR",
      cn: "食蜜熊",
      img: "honeyvore_bear.png",
      got: true,
      meta: ["栖息地", "Tabantha Frontier"],
      desc: "This king among animals is dangerous game for even the most seasoned hunters. They'll attack anyone who wanders into their territory regardless of the wanderer's weaponry. As their name implies, they have a natural love of honey. Extreme caution is advised when you spot one, but if you're sneaky enough and maybe just a little bit crazy... you just may be able to ride one.",
      cn_desc: "这种动物之王对最有经验的猎人来说也是危险的猎物。无论闯入者携带何种武器,它们都会攻击任何踏入其领地的生物。正如其名,它们天生喜爱蜂蜜。发现它们时务必极度小心,但如果你足够狡猾、甚至有点疯狂……说不定真能骑上一头。"
    },
    {
      no: "027",
      name: "GRIZZLEMAW BEAR",
      cn: "灰颚熊",
      img: "grizzlemaw_bear.png",
      got: true,
      meta: ["栖息地", "Hebra Mountains"],
      desc: "This breed of honeyvore bear is distinguished by its gray fur. Even more ferocious than their relatives, they're commonly believed to be the most dangerous wild animal. They live in deep snow away from villages, so it's uncommon to encounter one. That said, if you do find one, you'd be better off not picking a fight with it.",
      cn_desc: "这种食蜜熊的变种以灰色毛皮为特征。它们比近亲更加凶猛,被公认为最危险的野生动物。它们生活在远离村庄的深雪中,因此很少遇到。不过一旦遇上,最好不要和它打架。"
    },
    {
      no: "028",
      name: "HYLIAN RETRIEVER",
      cn: "海利亚寻回犬",
      img: "hylian_retriever.png",
      got: true,
      meta: ["栖息地", "Akkala Highlands"],
      desc: "The native breed of this mammal varies by region, but on thing remains true: this animals has been known as \"man's best friend\" since ancient times. They're very clever and obedient, so aside from serving as pets, they are also put to work watching over grazing livestock. It's said that all Hylian retrievers are descendants of the dog once owned by the king of Hyrule.",
      cn_desc: "这种哺乳动物的原生品种因地区而异,但有一点始终不变:自古以来它就被称为「人类最好的朋友」。它们非常聪明听话,除了当宠物,还被派去照看放牧的牲畜。据说所有海利亚寻回犬都是海拉鲁国王曾经养的那只狗的后代。"
    },
    {
      no: "029",
      name: "BLUPEE",
      cn: "蓝皮",
      img: "blupee.png",
      got: true,
      meta: ["栖息地", "Satori Mountain"],
      desc: "They may look like mere rabbits at a fleeting glance, but these strange and aptly named creatures glow with a mysterious blue light. While the details of their origins are entirely unknown, there is one thing we do know: these peculiar little things have a penchant for collecting rupees.",
      cn_desc: "乍一看它们就像普通的兔子,但这些名副其实的奇特生物会发出神秘的蓝光。虽然它们的起源完全不为人知,但有一点可以确定:这些奇妙的小家伙非常喜欢收集卢比。"
    },
    {
      no: "030",
      name: "COMMON SPARROW",
      cn: "普通麻雀",
      img: "common_sparrow.png",
      got: true,
      meta: ["栖息地", "Hyrule Field"],
      desc: "As the name suggests, these birds are rather common around Hyrule. They mainly live in the plains or forests but sometimes venture out to villages. Their diet consists of nuts and small insects. They look pretty cute when they jump around, but they don't have much love for people.",
      cn_desc: "正如其名,这种鸟在海拉鲁相当常见。它们主要生活在平原或森林,有时也会到村庄里。它们以坚果和小昆虫为食。跳来跳去的样子很可爱,但对人类没什么好感。"
    },
    {
      no: "031",
      name: "RED SPARROW",
      cn: "红雀",
      img: "red_sparrow.png",
      got: true,
      meta: ["栖息地", "Hebra Mountains"],
      desc: "These small birds live in the Hebra region and eat mainly nuts and wild plants. Their bright-red feathers are often used as decorations.",
      cn_desc: "这种小鸟栖息于海布拉地区,主要以坚果和野生植物为食。它们鲜红的羽毛常被用作装饰。"
    },
    {
      no: "032",
      name: "BLUE SPARROW",
      cn: "蓝雀",
      img: "blue_sparrow.png",
      got: true,
      meta: ["栖息地", "Lanayru Great Spring"],
      desc: "This breed of sparrow is most often seen in the Lanayru region. They get most of their food from leaves and plants that grow near water. If it's safe enough, they can be spotted bathing in puddles or shallow rivers.",
      cn_desc: "这种麻雀变种最常见于拉聂耳地区。它们主要从水边生长的叶子和植物中获取食物。环境安全时,可以看到它们在浅滩或小河里洗澡。"
    },
    {
      no: "033",
      name: "RAINBOW SPARROW",
      cn: "七彩麻雀",
      img: "rainbow_sparrow.png",
      got: true,
      meta: ["栖息地", "Faron Grasslands"],
      desc: "These small birds hail from the Faron region. As the name suggests, their feathers are more colorful than other sparrows', which has made them a favorite among dilettantes. They feed on small rain-forest insects, but the omnivore in them loves nuts as well.",
      cn_desc: "这种小鸟来自费罗尼地区。正如其名,它们的羽毛比普通麻雀更鲜艳,因此深受爱好者喜爱。它们以小型雨林昆虫为食,但作为杂食动物,它们也喜欢坚果。"
    },
    {
      no: "034",
      name: "SAND SPARROW",
      cn: "沙雀",
      img: "sand_sparrow.png",
      got: true,
      meta: ["栖息地", "Gerudo Desert"],
      desc: "This desert-dwelling breed of sparrow has adapted to withstand the heat in the arid climate of the Gerudo region. Sometimes they can be spotted half-buried in the sand, holding perfectly still as a means of evading predators.",
      cn_desc: "这种栖息于沙漠的麻雀变种,已适应格鲁德地区炎热干燥的气候。有时能看到它们半埋于沙中一动不动,以此躲避天敌。"
    },
    {
      no: "035",
      name: "GOLDEN SPARROW",
      cn: "黄金麻雀",
      img: "golden_sparrow.png",
      got: true,
      meta: ["栖息地", "Great Hyrule Forest"],
      desc: "This breed of sparrow is native to the Eldin region. Their down is resistant to burning, an evolutionary trait produced by the harsh volcanic environment. They subsist on small insects that hide inside rocks.",
      cn_desc: "这种麻雀变种原产于埃尔丁地区。它们的绒毛耐火,这是严酷的火山环境造就的进化特征。它们以藏在岩石缝隙里的小昆虫为食。"
    },
    {
      no: "036",
      name: "WOOD PIGEON",
      cn: "林鸽",
      img: "wood_pigeon.png",
      got: true,
      meta: ["栖息地", "Great Hyrule Forest"],
      desc: "These pigeons inhabit vast regions all throughout Hyrule, so they can often be found in forests, grasslands, or even villages. They don't have a very strong sense of awareness, so even less-skilled hunters can nab them pretty easily.",
      cn_desc: "这种鸽子遍布海拉鲁广大地区,在森林、草地甚至村庄里都很常见。它们的警觉性不高,即使技艺生疏的猎人也容易得手。"
    },
    {
      no: "037",
      name: "RAINBOW PIGEON",
      cn: "七彩鸽",
      img: "rainbow_pigeon.png",
      got: true,
      meta: ["栖息地", "Hyrule Ridge"],
      desc: "This breed of pigeon is well known for its vivid feathers. They live mainly in the northern forests and grasslands of Hyrule. They're most fond of nuts and grain but won't pass up the occasional insect or earthworm if offered. Their meat is of a higher quality than typical wood pigeon's.",
      cn_desc: "这种鸽子以鲜艳的羽毛闻名。它们主要生活在海拉鲁北部的森林和草地。它们最喜欢坚果和谷物,但偶尔也不拒绝昆虫或蚯蚓。它们的肉质比普通林鸽更佳。"
    },
    {
      no: "038",
      name: "HOTFEATHER PIGEON",
      cn: "暖羽鸽",
      img: "hotfeather_pigeon.png",
      got: true,
      meta: ["栖息地", "Eldin Canyon"],
      desc: "This rare breed of pigeon lives near Death Mountain. Their fireproof feathers are valuable as clothing material. Their meat, on the other hand, is not fireproof, and it'll burn up as soon as it's struck.",
      cn_desc: "这种珍稀鸽子栖息于死亡之山附近。它们防火的羽毛是珍贵的衣物材料。不过它们的肉并不防火,一旦被击中就会烧起来。"
    },
    {
      no: "039",
      name: "WHITE PIGEON",
      cn: "白鸽",
      img: "white_pigeon.png",
      got: true,
      meta: ["栖息地", "Hebra Mountains"],
      desc: "This white-feathered breed of pigeon lives in the Hebra region. It's said that a wood pigeon survived atop a snowy mountain by changing its colors to blend in with the snow and soon after became a white pigeon. They have an extra layer of fat to guard against the cold, so they have been known to yield high-quality meat.",
      cn_desc: "这种白羽鸽栖息于海布拉地区。据说一只林鸽为了融入雪地而改变体色,幸存于雪山之上,不久后变成了白鸽。它们有一层额外脂肪御寒,因此能产出高品质的肉。"
    },
    {
      no: "040",
      name: "MOUNTAIN CROW",
      cn: "山鸦",
      img: "mountain_crow.png",
      got: true,
      meta: ["栖息地", "Hyrule Ridge"],
      desc: "This bird is known for its cleverness and for its distinct claws. They make their homes in the mountains, forests, and villages alike. Not only are their jet-black feathers seen as an ill omen, but they'll steal crops right out of a farmer's hands if given the chance. Because of this, they're often met with enmity.",
      cn_desc: "这种鸟以聪明和独特的爪子著称。它们在山地、森林和村庄中安家。它们乌黑的羽毛被视为不祥之兆,而且一有机会就会偷走农夫手中的庄稼,因此常常招致敌意。"
    },
    {
      no: "041",
      name: "BRIGHT-CHESTED DUCK",
      cn: "亮胸鸭",
      img: "bright-chested_duck.png",
      got: true,
      meta: ["栖息地", "Hyrule Ridge"],
      desc: "These birds can be found on waterfronts all over Hyrule. Their webbed feet make them excellent swimmers, and their long necks allow them to duck their heads underwater to find food. Their fatty meat is high quality.",
      cn_desc: "这种鸟在海拉鲁各地的水边都能找到。它们带蹼的脚使它们成为出色的游泳健将,长长的脖子能探入水下觅食。它们的肉脂肪丰厚,品质上乘。"
    },
    {
      no: "042",
      name: "BLUE-WINGED HERON",
      cn: "蓝翼鹭",
      img: "blue-winged_heron.png",
      got: true,
      meta: ["栖息地", "Hyrule Ridge"],
      desc: "These birds live on waterfronts all throughout Hyrule. Their characteristically thin legs and long necks help them catch water-dwelling fish or frogs for food. They lie perfectly still in wait for their prey and then stretch out their long necks to capture their meal.",
      cn_desc: "这种鸟栖息于海拉鲁各地的水边。它们细长的腿和长脖子帮助它们捕捉水中的鱼或青蛙为食。它们会一动不动地等待猎物,然后伸长脖子捕获美食。"
    },
    {
      no: "043",
      name: "PINK HERON",
      cn: "粉鹭",
      img: "pink_heron.png",
      got: true,
      meta: ["栖息地", "Hyrule Ridge"],
      desc: "This breed of Heron is characterized by the pink tips of its feathers. Unlike its waterfront-dwelling relative the blue-winged heron, these live in grasslands or arid regions and subsist on insects that live in the grass. They can often be found walking about searching for food but will fly away if they sense danger.",
      cn_desc: "这种鹭以羽毛末端的粉红色为特征。与栖息于水边的近亲蓝翼鹭不同,它们生活在草地或干旱地区,以草丛中的昆虫为食。经常能看到它们四处走动觅食,一旦感到危险便会飞走。"
    },
    {
      no: "044",
      name: "ISLANDER HAWK",
      cn: "岛鹰",
      img: "islander_hawk.png",
      got: true,
      meta: ["栖息地", "Hyrule Field"],
      desc: "These carnivorous birds live in plains or highlands. They use their sharp talons and beaks to catch and eat small animals and other birds. They soar calmly through the sky and search for prey from above.",
      cn_desc: "这种食肉鸟生活在平原或高地。它们用锐利的爪和喙捕捉小动物及其他鸟类为食。它们在高空优雅地盘旋,从上方搜寻猎物。"
    },
    {
      no: "045",
      name: "SEAGULL",
      cn: "海鸥",
      img: "seagull.png",
      got: true,
      meta: ["栖息地", "Necluda Sea"],
      desc: "These birds live near the ocean. They eat mainly fish, so a flock of seagulls hovering over water is a good indication of where there are fish. Fisherman use this to their advantage when searching for a catch of their own.",
      cn_desc: "这种鸟生活在海边。它们主要以鱼为食,因此海鸥群盘旋的水面正是鱼群所在的好兆头。渔夫们会利用这一点寻找渔获。"
    },
    {
      no: "046",
      name: "ELDIN OSTRICH",
      cn: "奥尔丁鸵鸟",
      img: "eldin_ostrich.png",
      got: true,
      meta: ["栖息地", "Eldin Canyon"],
      desc: "This large bird makes its home in the volcanic region of Eldin. Their heat-resistant feathers and skin are evolutionary traits produced by the harsh environment. Their wings are too small to facilitate flight, but their long legs make them pretty speedy runners.",
      cn_desc: "这种大型鸟类栖息于埃尔丁的火山地区。它们耐热的羽毛和皮肤是严酷环境造就的进化特征。它们的翅膀太小无法飞行,但长腿使它们跑得飞快。"
    },
    {
      no: "047",
      name: "CUCCO",
      cn: "库丘鸟",
      img: "cucco.png",
      got: true,
      meta: ["栖息地", "West Necluda"],
      desc: "Villages often raise these birds for their eggs, but some people actually keep them as pets. They can't fly, but can flap their wings mighty furiously if picked up. They're usually calm creatures, but if you're persistent in your torment of them... Well...",
      cn_desc: "村庄常饲养这种鸟来获取鸡蛋,也有人把它们当宠物养。它们不会飞,但被拎起时会拼命扑扇翅膀。它们平时性情温和,但如果你执意捉弄它们……嗯……"
    },
    {
      no: "048",
      name: "HYRULE BASS",
      cn: "海拉鲁鲈鱼",
      img: "hyrule_bass.png",
      got: true,
      meta: ["栖息地", "Hyrule Field"],
      desc: "An ordinary fish that can be found all over Hyrule. It can be eaten raw, but cooking it amplifies its healing benefits.",
      cn_desc: "一种在海拉鲁随处可见的普通鱼。可以生吃,但烹煮能增强其回复效果。"
    },
    {
      no: "049",
      name: "HEARTY BASS",
      cn: "精力鲈鱼",
      img: "hearty_bass.png",
      got: true,
      meta: ["栖息地", "West Necluda"],
      desc: "This large fish lives near the shoreline. Its sizable body can store a lot of nutrients. When cooked into a dish, it will temporarily increase your maximum hearts.",
      cn_desc: "这种大鱼栖息于海岸附近。它庞大的身体能储存大量营养。烹煮成料理后,能暂时提升你的最大心数。"
    },
    {
      no: "050",
      name: "STAMINOKA BASS",
      cn: "耐力鲈鱼",
      img: "staminoka_bass.png",
      got: true,
      meta: ["栖息地", "Hyrule Field"],
      desc: "This Hyrule bass got to be the biggest fish by never getting caught (until now). Its long life results in a cooked dish that will restore a lot of stamina.",
      cn_desc: "这种海拉鲁鲈鱼因从未被捕获而长成了最大的鱼(直到现在)。它长寿的生命体现在料理中,能大量回复精力。"
    },
    {
      no: "051",
      name: "HEARTY SALMON",
      cn: "精力鲑鱼",
      img: "hearty_salmon.png",
      got: true,
      meta: ["栖息地", "Tabantha Frontier"],
      desc: "This fish makes its home in cold water, giving it extra layers of fat. It temporarily increases your maximum hearts when used in cooking.",
      cn_desc: "这种鱼栖息于冷水中,因此有多层脂肪。用于烹饪时能暂时提升最大心数。"
    },
    {
      no: "052",
      name: "CHILLFIN TROUT",
      cn: "冷鳍鳟鱼",
      img: "chillfin_trout.png",
      got: true,
      meta: ["栖息地", "Tabantha Frontier"],
      desc: "This blue trout prefers cold bodies of water. Its skin contains enzymes that keep its body cool, and when cooked into a dish, it will temporarily boost your heat resistance.",
      cn_desc: "这种蓝鳟鱼喜欢冷水域。它的皮肤含有保持身体凉爽的酶,烹煮成料理后能暂时提升耐热性。"
    },
    {
      no: "053",
      name: "SIZZLEFIN TROUT",
      cn: "热鳍鳟鱼",
      img: "sizzlefin_trout.png",
      got: true,
      meta: ["栖息地", "Eldin Canyon"],
      desc: "This red trout prefers warm bodies of water. It has a special organ specifically for storing heat. When cooked into a dish, it will temporarily increase your resistance to the cold.",
      cn_desc: "这种红鳟鱼喜欢温水域。它拥有专门储存热量的器官。烹煮成料理后,能暂时提升抗寒能力。"
    },
    {
      no: "054",
      name: "VOLTFIN TROUT",
      cn: "电鳍鳟鱼",
      img: "voltfin_trout.png",
      got: true,
      meta: ["栖息地", "Tabantha Frontier"],
      desc: "This trout makes its home in the freshwater lakes. Its scales have an insulating compound that, when cooked into a dish, offers resistance to electricity.",
      cn_desc: "这种鳟鱼栖息于淡水湖中。它的鳞片含有绝缘成分,烹煮成料理后能提供耐电性。"
    },
    {
      no: "055",
      name: "STEALTHFIN TROUT",
      cn: "潜鳍鳟鱼",
      img: "stealthfin_trout.png",
      got: true,
      meta: ["栖息地", "Great Hyrule Forest"],
      desc: "Consuming the bioluminescent compound that makes this fish glow in the dark will increase concentration. Dishes cooked with it will suppress noise when consumed.",
      cn_desc: "食用让这种鱼在黑暗中发光的生物发光成分,能提高专注力。用它烹煮的料理,食用后能抑制声响。"
    },
    {
      no: "056",
      name: "MIGHTY CARP",
      cn: "强壮鲤鱼",
      img: "mighty_carp.png",
      got: true,
      meta: ["栖息地", "Akkala Highlands"],
      desc: "This freshwater fish lives alongside its less mighty carp ilk. A compound in its liver promotes muscle growth. Dishes cooked with it will temporarily increase your attack power.",
      cn_desc: "这种淡水鱼与它没那么强壮的鲤鱼同类生活在一起。它肝脏中的成分能促进肌肉生长。烹煮成料理后能暂时提升攻击力。"
    },
    {
      no: "057",
      name: "ARMORED CARP",
      cn: "盔甲鲤鱼",
      img: "armored_carp.png",
      got: true,
      meta: ["栖息地", "Lanayru Great Spring"],
      desc: "Calcium deposits in the scales of this ancient fish make them as hard as armor. Cooking it into a dish will fortify your bones, temporarily increasing your defense.",
      cn_desc: "这种古代鱼鳞片中的钙质沉积使其坚硬如盔甲。将其烹煮成料理能强化骨骼,暂时提升防御力。"
    },
    {
      no: "058",
      name: "SANKE CARP",
      cn: "三色鲤",
      img: "sanke_carp.png",
      got: true,
      meta: ["栖息地", "West Necluda"],
      desc: "This wild armored carp has been bred into a prizewinning fish. Its beautifully colored markings do not occur in nature. It offers no special effects when cooked.",
      cn_desc: "这种野生盔甲鲤被培育成了获奖名鱼。它美丽的彩色斑纹在自然界并不存在。烹煮后没有任何特殊效果。"
    },
    {
      no: "059",
      name: "MIGHTY PORGY",
      cn: "强壮鲷鱼",
      img: "mighty_porgy.png",
      got: true,
      meta: ["栖息地", "Necluda Sea"],
      desc: "This ocean-dwelling fish comes with one rude attitude. The compounds in its flesh elevate your competitive spirit when it's cooked into a dish, thus increasing your attack power.",
      cn_desc: "这种生活在海里的鱼态度相当粗鲁。烹煮成料理后,它肉质中的成分能激发你的竞争心,从而提升攻击力。"
    },
    {
      no: "060",
      name: "ARMORED PORGY",
      cn: "盔甲鲷鱼",
      img: "armored_porgy.png",
      got: true,
      meta: ["栖息地", "Necluda Sea"],
      desc: "This porgy's body is covered in armor-hard scales. The compounds in its scales, when cooked into a dish, fortify your bones and temporarily boost your defense.",
      cn_desc: "这种鲷鱼全身覆盖着盔甲般坚硬的鳞片。其鳞片中的成分烹煮成料理后,能强化骨骼,暂时提升防御力。"
    },
    {
      no: "061",
      name: "SNEAKY RIVER SNAIL",
      cn: "隐秘河螺",
      img: "sneaky_river_snail.png",
      got: true,
      meta: ["栖息地", "West Necluda"],
      desc: "This large, glow-in-the-dark snail lives in fresh water. When cooked into a dish, it heightens your senses so you can move about silently.",
      cn_desc: "这种大型、会在黑暗中发光的蜗牛生活在淡水中。烹煮成料理后,它能强化你的感官,让你悄无声息地移动。"
    },
    {
      no: "062",
      name: "HEARTY BLUESHELL SNAIL",
      cn: "精力蓝壳蜗牛",
      img: "hearty_blueshell_snail.png",
      got: true,
      meta: ["栖息地", "Lanayru Sea"],
      desc: "This snail lives on sandy beaches in large numbers. Its flesh contains a high amount of stimulants, so when cooked into a dish, it temporarily increases your maximum hearts.",
      cn_desc: "这种蜗牛大量栖息于沙滩。它的肉质含有大量兴奋成分,烹煮成料理后能暂时提升最大心数。"
    },
    {
      no: "063",
      name: "RAZORCLAW CRAB",
      cn: "利爪蟹",
      img: "razorclaw_crab.png",
      got: true,
      meta: ["栖息地", "Necluda Sea"],
      desc: "This crab is well known for its exceptionally sharp pincers. When cooked, the strength compound in its claws will increase your attack power.",
      cn_desc: "这种蟹以极其锋利的螯而闻名。烹煮后,其螯中的力量成分能提升你的攻击力。"
    },
    {
      no: "064",
      name: "IRONSHELL CRAB",
      cn: "铁壳蟹",
      img: "ironshell_crab.png",
      got: true,
      meta: ["栖息地", "Necluda Sea"],
      desc: "This crab's shell is particularly hard. When cooked into dish, its fat and meat bolster the body to increase your defense.",
      cn_desc: "这种蟹的壳特别坚硬。烹煮成料理后,其脂肪和肉能强健身体,提升防御力。"
    },
    {
      no: "065",
      name: "BRIGHT-EYED CRAB",
      cn: "亮眼蟹",
      img: "bright-eyed_crab.png",
      got: true,
      meta: ["栖息地", "Lanayru Great Spring"],
      desc: "This crab appears in large numbers when it rains. Once bite of its delectable meat, and you'll forget all your exhaustion. Replenishes your stamina when cooked into a dish.",
      cn_desc: "这种蟹在下雨时会大量出现。只要尝一口它美味的肉,你就会忘掉所有疲惫。烹煮成料理后能回复精力。"
    },
    {
      no: "066",
      name: "FAIRY",
      cn: "妖精",
      img: "fairy.png",
      got: true,
      meta: ["栖息地", "Greater Hyrule"],
      desc: "This fairy will fly from your pouch and heal all your wounds the moment you lose your last heart. It's easily mistaken for a firefly at first, but it glows in the daylight as well as night.",
      cn_desc: "这种妖精会在你失去最后一颗心的瞬间从口袋飞出,治愈你所有伤口。乍看之下很容易被误认为萤火虫,但它白天和夜晚都会发光。"
    },
    {
      no: "067",
      name: "WINTERWING BUTTERFLY",
      cn: "冬翅蝶",
      img: "winterwing_butterfly.png",
      got: true,
      meta: ["栖息地", "Hyrule Ridge"],
      desc: "The powdery scales of this butterfly's wings cool the air around it. Watching it flutter around snowflakes is a thing of beauty. Cook it with monster parts for a heat-resistant elixir.",
      cn_desc: "这种蝴蝶翅膀上的粉状鳞片能冷却周围的空气。看着它在雪花间飞舞,真是赏心悦目。与怪物素材一起烹煮,可制成耐热药水。"
    },
    {
      no: "068",
      name: "SUMMERWING BUTTERFLY",
      cn: "夏翅蝶",
      img: "summerwing_butterfly.png",
      got: true,
      meta: ["栖息地", "Great Hyrule Forest"],
      desc: "A butterfly found in the woods and plains of warm regions. Its wings absorb the warmth of the sun. Cook it with monster parts to create an elixir that makes you feel warm and fuzzy.",
      cn_desc: "常见于温暖地区森林和草地的一种蝴蝶。它的翅膀吸收阳光的温暖。与怪物素材一起烹煮,可制成让你浑身暖洋洋的药水。"
    },
    {
      no: "069",
      name: "THUNDERWING BUTTERFLY",
      cn: "雷翅蝶",
      img: "thunderwing_butterfly.png",
      got: true,
      meta: ["栖息地", "Hyrule Ridge"],
      desc: "This rare butterfly only shows itself when it rains. The organs in its body produce an insulating compound. When made into an elixir, it offers electrical resistance.",
      cn_desc: "这种珍稀蝴蝶只在雨天现身。它体内的器官能产生绝缘成分。制成药水后,能提供耐电性。"
    },
    {
      no: "070",
      name: "SMOTHERWING BUTTERFLY",
      cn: "焖翅蝶",
      img: "smotherwing_butterfly.png",
      got: true,
      meta: ["栖息地", "Eldin Canyon"],
      desc: "A butterfly found in the woods and plains of warm regions. Its wings absorb the warmth of the sun. Cook it with monster parts to create an elixir that makes you feel warm and fuzzy.",
      cn_desc: "常见于温暖地区森林和草地的一种蝴蝶。它的翅膀吸收阳光的温暖。与怪物素材一起烹煮,可制成让你浑身暖洋洋的药水。"
    },
    {
      no: "071",
      name: "COLD DARNER",
      cn: "寒蜻蜓",
      img: "cold_darner.png",
      got: true,
      meta: ["栖息地", "Tabantha Frontier"],
      desc: "This dragonfly prefers the cool shade of trees to the warmth of the sun. Its wings disperse heat from its body, which can be cooked into a heat-resistance elixir.",
      cn_desc: "这种蜻蜓比起阳光,更喜欢树荫的凉爽。它的翅膀能驱散身体的热量,可烹煮成耐热药水。"
    },
    {
      no: "072",
      name: "WARM DARNER",
      cn: "暖蜻蜓",
      img: "warm_darner.png",
      got: true,
      meta: ["栖息地", "Akkala Highlands"],
      desc: "This dragonfly has a special organ that causes it to sweat profusely. Cook it with monster parts for an elixir that will raise your core temperature so you can resist the cold.",
      cn_desc: "这种蜻蜓有特殊的器官,会使它大量出汗。与怪物素材一起烹煮,可制成提升核心体温、抵御寒冷的药水。"
    },
    {
      no: "073",
      name: "ELECTRIC DARNER",
      cn: "电蜻蜓",
      img: "electric_darner.png",
      got: true,
      meta: ["栖息地", "Hyrule Ridge"],
      desc: "This rare dragonfly only appears in the rain. Its wings direct electricity away from its body. Cook it with monster parts for an electricity-resistance elixir.",
      cn_desc: "这种珍稀蜻蜓只在雨天出现。它的翅膀能将电流导离身体。与怪物素材一起烹煮,可制成耐电药水。"
    },
    {
      no: "074",
      name: "RESTLESS CRICKET",
      cn: "躁动蟋蟀",
      img: "restless_cricket.png",
      got: true,
      meta: ["栖息地", "Hyrule Field"],
      desc: "A very energetic cricket. Cook it with monster parts to create a stamina-recovery elixir.",
      cn_desc: "一种非常有活力的蟋蟀。与怪物素材一起烹煮,可制成回复精力的药水。"
    },
    {
      no: "075",
      name: "BLADED RHINO BEETLE",
      cn: "刀角犀金龟",
      img: "bladed_rhino_beetle.png",
      got: true,
      meta: ["栖息地", "West Necluda"],
      desc: "This beetle's razor-sharp horns demand that you handle it with care. Boil the horns alongside monster parts to concoct an elixir that will raise your attack power.",
      cn_desc: "这种甲虫剃刀般锋利的角要求你必须小心处理。将角与怪物素材一起烹煮,可调配出提升攻击力的药水。"
    },
    {
      no: "076",
      name: "RUGGED RHINO BEETLE",
      cn: "粗犷犀金龟",
      img: "rugged_rhino_beetle.png",
      got: true,
      meta: ["栖息地", "Hyrule Field"],
      desc: "This beetle's hard body resembles armor. When the shell is cooked with monster parts, the resulting elixir boosts your defense.",
      cn_desc: "这种甲虫坚硬的身体如同盔甲。将甲壳与怪物素材一起烹煮,所得药水能提升防御力。"
    },
    {
      no: "077",
      name: "ENERGETIC RHINO BEETLE",
      cn: "活力犀金龟",
      img: "energetic_rhino_beetle.png",
      got: true,
      meta: ["栖息地", "Akkala Highlands"],
      desc: "This valuable beetle can live up to ten years. When cooked with monster parts, its impressive vitality translates into an elixir that will greatly restore your stamina.",
      cn_desc: "这种珍贵的甲虫可以活到十年之久。与怪物素材一起烹煮,它惊人的生命力会转化为大幅回复精力的药水。"
    },
    {
      no: "078",
      name: "SUNSET FIREFLY",
      cn: "黄昏萤火虫",
      img: "sunset_firefly.png",
      got: true,
      meta: ["栖息地", "West Necluda"],
      desc: "These fireflies glow gently in the dark. When cooked with monster parts, the compound that causes it to glow results in an elixir that will allow you to move more quietly.",
      cn_desc: "这种萤火虫在黑暗中发出柔和的光。与怪物素材一起烹煮时,使其发光的成分能制成让你移动更悄无声息的药水。"
    },
    {
      no: "079",
      name: "HOT-FOOTED FROG",
      cn: "热足蛙",
      img: "hot-footed_frog.png",
      got: true,
      meta: ["栖息地", "Lanayru Great Spring"],
      desc: "A quick frog that can be found hopping around near water. Cook it with monster parts to draw out its speed-boost effect.",
      cn_desc: "一种敏捷的青蛙,常见于水边蹦跳。与怪物素材一起烹煮,可引出其速度提升的效果。"
    },
    {
      no: "080",
      name: "TIRELESS FROG",
      cn: "不知疲倦的蛙",
      img: "tireless_frog.png",
      got: true,
      meta: ["栖息地", "Lanayru Great Spring"],
      desc: "This rare frog only ventures out in the rain. When cooked with monster parts, the elixir it produces will temporarily increase your maximum stamina.",
      cn_desc: "这种珍稀青蛙只在雨天外出。与怪物素材一起烹煮,制成的药水能暂时提升最大精力。"
    },
    {
      no: "081",
      name: "HIGHTAIL LIZARD",
      cn: "高尾蜥蜴",
      img: "hightail_lizard.png",
      got: true,
      meta: ["栖息地", "West Necluda"],
      desc: "A lizard found throughout Hyrule. It's a but slow to react at times, but it given a chance to escape, it will dart off quickly. Cook it with monster parts for a speed-boosting elixir.",
      cn_desc: "一种遍布海拉鲁的蜥蜴。它有时反应稍慢,但一有机会逃跑,就会飞快地窜走。与怪物素材一起烹煮,可制成提升速度的药水。"
    },
    {
      no: "082",
      name: "HEARTY LIZARD",
      cn: "精力蜥蜴",
      img: "hearty_lizard.png",
      got: true,
      meta: ["栖息地", "Gerudo Desert"],
      desc: "This rare lizard lives deep in the forests. It feeds on high-nutrient foods, giving it great vitality. When used to make elixirs, they temporarily increase your maximum hearts.",
      cn_desc: "这种珍稀蜥蜴生活在森林深处。它以高营养的食物为食,因此生命力旺盛。用于制药水时,能暂时提升最大心数。"
    },
    {
      no: "083",
      name: "FIREPROOF LIZARD",
      cn: "耐火蜥蜴",
      img: "fireproof_lizard.png",
      got: true,
      meta: ["栖息地", "Eldin Canyon"],
      desc: "This rare lizard can only be found in the Eldin region. Its scales have heat-resistant properties, so when cooked with monster parts it produces a heat-resistance elixir.",
      cn_desc: "这种珍稀蜥蜴只能在埃尔丁地区找到。它的鳞片具有耐热特性,与怪物素材一起烹煮可制成耐热药水。"
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
      desc: "This low-level, gel-based monster can be found all over Hyrule. It tends to spring its attacks on unsuspecting prey from the ground or from trees. Its strength varies by size, and the type of jelly it drops varies depending on whether the Chuchu was heated up, cooled down, or shocked.",
      cn_desc: "这种低级的胶质怪物遍布海拉鲁各地。它常常从地面或树上出其不意地袭击毫无防备的猎物。它的强度随体型而异,掉落的胶质类型则取决于丘丘是被加热、冷却还是被电击。"
    },
    {
      no: "085",
      name: "FIRE CHUCHU",
      cn: "火丘丘",
      img: "fire_chuchu.png",
      got: true,
      meta: ["出没", "Eldin Canyon"],
      desc: "This low-level gel monster is engulfed in flames. Its strength varies depending on its size. It tends to explode if attacked from close range, so the use of spears, arrows, and other ranged weapons is advised.",
      cn_desc: "这种低级胶质怪物全身燃烧着火焰。它的强度随体型而异。近距离攻击会导致它爆炸,因此建议使用长枪、弓箭等远程武器。"
    },
    {
      no: "086",
      name: "ICE CHUCHU",
      cn: "冰丘丘",
      img: "ice_chuchu.png",
      got: true,
      meta: ["出没", "Gerudo Highlands"],
      desc: "This low-level gel monster is engulfed in freezing-cold air. Its strength varies depending on its size. It tends to explode if attacked from close range, so the use of spears, arrows, and other ranged weapons is advised.",
      cn_desc: "这种低级胶质怪物周身环绕着刺骨的寒气。它的强度随体型而异。近距离攻击会导致它爆炸,因此建议使用长枪、弓箭等远程武器。"
    },
    {
      no: "087",
      name: "ELECTRIC CHUCHU",
      cn: "电丘丘",
      img: "electric_chuchu.png",
      got: true,
      meta: ["出没", "Gerudo Highlands"],
      desc: "This low-level gel monster is engulfed in electricity. Its strength varies depending on its size. It tends to explode if attacked from close range, so the use of spears, arrows, and other ranged weapons is advised.",
      cn_desc: "这种低级胶质怪物周身缠绕着电流。它的强度随体型而异。近距离攻击会导致它爆炸,因此建议使用长枪、弓箭等远程武器。"
    },
    {
      no: "088",
      name: "KEESE",
      cn: "奇斯",
      img: "keese.png",
      got: true,
      meta: ["出没", "Hyrule Field"],
      desc: "The unpredictable flight pattern of this noctoural bat-like species can make fighting them a nuisance, but they're weak enough to fell with a single strike. Sometimes they'll attack in packs, but even then, a pack can be sent packing with a single attack.",
      cn_desc: "这种夜行蝙蝠类怪物的飞行轨迹飘忽不定,与之战斗相当麻烦,但它们很弱,一击就能击倒。有时它们会成群进攻,即便如此,一次攻击也能让整个群体落荒而逃。"
    },
    {
      no: "089",
      name: "FIRE KEESE",
      cn: "火奇斯",
      img: "fire_keese.png",
      got: true,
      meta: ["出没", "Eldin Canyon"],
      desc: "The fire that engulfs the bodies of these bat-like Keese makes them more dangerous than the standard type. They're capable of setting fire to anything they touch.",
      cn_desc: "与普通奇斯相比,这些蝙蝠状奇斯身上燃烧的火焰使它们更加危险。它们接触到的任何东西都会被点燃。"
    },
    {
      no: "090",
      name: "ICE KEESE",
      cn: "冰奇斯",
      img: "ice_keese.png",
      got: true,
      meta: ["出没", "Hebra Mountains"],
      desc: "The intense frost that engulfs the bodies of these bat-like Keese makes them more dangerous than the standard type. They're capable of freezing anything they touch.",
      cn_desc: "与普通奇斯相比,这些蝙蝠状奇斯身上覆盖的严寒使它们更加危险。它们接触到的任何东西都会被冻结。"
    },
    {
      no: "091",
      name: "ELECTRIC KEESE",
      cn: "电奇斯",
      img: "electric_keese.png",
      got: true,
      meta: ["出没", "Lanayru Great Spring"],
      desc: "The electricity that engulfs the bodies of these bat-like Keese makes them more dangerous than the standard type. They're capable of shocking anything they touch.",
      cn_desc: "与普通奇斯相比,这些蝙蝠状奇斯周身缠绕的电流使它们更加危险。它们接触到的任何东西都会触电。"
    },
    {
      no: "092",
      name: "WATER OCTOROK",
      cn: "水八爪怪",
      img: "water_octorok.png",
      got: true,
      meta: ["出没", "West Necluda"],
      desc: "Although they spend most of their time in water, the drop in barometric pressure that occurs when it rains causes an air sac within these octopus-like monsters to inflate and lift them into the air. The rocks they spit out can be bounced back with a shield.",
      cn_desc: "虽然它们大部分时间待在水里,但下雨时气压下降,会使这种章鱼状怪物体内的气囊膨胀,将它们带到空中。它们吐出的岩石可以用盾牌弹回去。"
    },
    {
      no: "093",
      name: "FOREST OCTOROK",
      cn: "森林八爪怪",
      img: "forest_octorok.png",
      got: true,
      meta: ["出没", "Hyrule Ridge"],
      desc: "Although originally an aquatic species, this type has adapted to life in the forest. They hide among the trees, disguising themselves as grass or unassuming shrubbery, and then attack when someone wanders by.",
      cn_desc: "这种八爪怪原本是水生生物,却适应了森林生活。它们藏在树丛中,伪装成草丛或不起眼的灌木,待有人路过时发动袭击。"
    },
    {
      no: "094",
      name: "ROCK OCTOROK",
      cn: "岩八爪怪",
      img: "rock_octorok.png",
      got: true,
      meta: ["出没", "Eldin Canyon"],
      desc: "This octopus-like species of monster lives in volcanic regions. When they inhale, they're preparing to spit out flaming rocks but have been known to suck up weapons or bombs in the same breath.",
      cn_desc: "这种章鱼状怪物栖息于火山地区。当它们吸气时,是在准备吐出燃烧的岩石,不过也曾有它们把武器或炸弹一并吸进去的记录。"
    },
    {
      no: "095",
      name: "SNOW OCTOROK",
      cn: "雪八爪怪",
      img: "snow_octorok.png",
      got: true,
      meta: ["出没", "Gerudo Highlands"],
      desc: "These octopus-like monsters live in snowy fields and disguise themselves as grass. When someone wanders by, they spring into action and attack by spitting snowballs.",
      cn_desc: "这种章鱼状怪物生活在雪原,伪装成草丛。有人路过时,它们会突然行动,吐出雪球攻击。"
    },
    {
      no: "096",
      name: "TREASURE OCTOROK",
      cn: "宝藏八爪怪",
      img: "treasure_octorok.png",
      got: true,
      meta: ["出没", "Gerudo Highlands"],
      desc: "These particularly clever monsters bury themselves in deep sand or snow and disguise themselves as treasure chests. Anyone who approaches the chests is attacked. The treasures chests are not magnetic, which proves that they are actually a part of these monsters' bodies.",
      cn_desc: "这种特别聪明的怪物把自己埋在深沙或深雪中,伪装成宝箱。任何靠近宝箱的人都会遭到攻击。宝箱没有磁性,这证明它们其实是这些怪物身体的一部分。"
    },
    {
      no: "097",
      name: "FIRE WIZZROBE",
      cn: "火威兹罗",
      img: "fire_wizzrobe.png",
      got: true,
      meta: ["出没", "Hyrule Field"],
      desc: "These spell-casting monsters can be found all over Hyrule. They use their fire rods to hurl fireballs or to summon flaming monsters and have been known to severely raise the temperature around them. The weather will normalize once the Wizzrobe is defeated.",
      cn_desc: "这种会施法的怪物遍布海拉鲁各地。它们用火焰杖投掷火球或召唤火焰怪物,据说还会使周围温度急剧升高。威兹罗被打败后,天气会恢复正常。"
    },
    {
      no: "098",
      name: "ICE WIZZROBE",
      cn: "冰威兹罗",
      img: "ice_wizzrobe.png",
      got: true,
      meta: ["出没", "Gerudo Highlands"],
      desc: "These spell-casting monsters can be found all over Hyrule. They use their ice rods to create freezing blasts of air or to summon frozen monsters and have been known to cause blizzards to severely decrease the temperatures around them. The weather will normalize once the Wizzrobe is defeated.",
      cn_desc: "这种会施法的怪物遍布海拉鲁各地。它们用冰杖制造冰冻气流或召唤冰冻怪物,据说还会引发暴风雪使周围温度急剧下降。威兹罗被打败后,天气会恢复正常。"
    },
    {
      no: "099",
      name: "ELECTRIC WIZZROBE",
      cn: "电威兹罗",
      img: "electric_wizzrobe.png",
      got: true,
      meta: ["出没", "Hyrule Ridge"],
      desc: "These spell-casting monsters can be found all over Hyrule. They use their lightning rods to hurl balls of electricity or to summon monsters surging with electricity and have been known to cause thunderstorms in the area. The weather will normalize once the Wizzrobe has been defeated.",
      cn_desc: "这种会施法的怪物遍布海拉鲁各地。它们用雷杖投掷电球或召唤带电怪物,据说还会在该地区引发雷暴。威兹罗被打败后,天气会恢复正常。"
    },
    {
      no: "100",
      name: "METEO WIZZROBE",
      cn: "陨石威兹罗",
      img: "meteo_wizzrobe.png",
      got: true,
      meta: ["出没", "Hyrule Field"],
      desc: "These spell-casting monsters can be found all over Hyrule. They use their meteor rods to hurl fireballs or to summon flaming monsters and have been known to severely raise the temperature around them. The weather will normalize once the Wizzrobe is defeated.",
      cn_desc: "这种会施法的怪物遍布海拉鲁各地。它们用陨石杖投掷火球或召唤火焰怪物,据说还会使周围温度急剧升高。威兹罗被打败后,天气会恢复正常。"
    },
    {
      no: "101",
      name: "BLIZZROBE",
      cn: "暴雪威兹罗",
      img: "blizzrobe.png",
      got: true,
      meta: ["出没", "Hyrule Field"],
      desc: "These spell-casting monsters can be found all over Hyrule. They use their blizzard rods to create freezing blasts of air or to summon frozen monsters and have been known to cause blizzards to severely decrease the temperature around them. The weather will normalize once the Blizzrobe is defeated.",
      cn_desc: "这种会施法的怪物遍布海拉鲁各地。它们用暴雪杖制造冰冻气流或召唤冰冻怪物,据说还会引发暴风雪使周围温度急剧下降。暴雪威兹罗被打败后,天气会恢复正常。"
    },
    {
      no: "102",
      name: "THUNDER WIZZROBE",
      cn: "雷霆威兹罗",
      img: "thunder_wizzrobe.png",
      got: true,
      meta: ["出没", "Hyrule Field"],
      desc: "These spell-casting monsters can be found all over Hyrule. They use their thunderstorm rods to hurl balls of electricity or to summon monsters surging with electricity and have been known to cause thunderstorms in the area. The weather will normalize once the Wizzrobe is defeated.",
      cn_desc: "这种会施法的怪物遍布海拉鲁各地。它们用雷暴杖投掷电球或召唤带电怪物,据说还会在该地区引发雷暴。威兹罗被打败后,天气会恢复正常。"
    },
    {
      no: "103",
      name: "BOKOBLIN",
      cn: "波克布林",
      img: "bokoblin.png",
      got: true,
      meta: ["出没", "Hyrule Field"],
      desc: "This common species is a nuisance all over Hyrule. Some have unified in the time following the Great Calamity and have formed factions of bandits. While not very clever, they are at least intelligent enough to hunt beasts and grill their meat for food. Though they're typically ferocious carnivores, they actually enjoy fruit as well.",
      cn_desc: "这种常见怪物遍布海拉鲁各地,十分烦人。大灾厄之后,一些波克布林团结起来,形成了匪帮。它们虽然不算聪明,但至少足够聪明到会捕猎野兽并烤肉为食。虽然它们通常是凶猛的肉食动物,但其实也喜欢水果。"
    },
    {
      no: "104",
      name: "BLUE BOKOBLIN",
      cn: "蓝色波克布林",
      img: "blue_bokoblin.png",
      got: true,
      meta: ["出没", "Gerudo Desert"],
      desc: "This common species is a nuisance all over Hyrule. They're tougher and have stronger weapons than the red Bokoblins - and are a little more clever, as well. At the very least, they have figured out that they can simply kick a Remote Bomb out of the way to avoid its blast.",
      cn_desc: "这种常见怪物遍布海拉鲁各地,十分烦人。它们比红色波克布林更强壮、武器更精良,也更狡猾一些。至少它们已经明白,把遥控炸弹踢开就能躲过爆炸。"
    },
    {
      no: "105",
      name: "BLACK BOKOBLIN",
      cn: "黑色波克布林",
      img: "black_bokoblin.png",
      got: true,
      meta: ["出没", "Hyrule Field"],
      desc: "Although Bokoblins are generally a nuisance, the Black Bokoblins are among the most dangerous type. They're extremely resilient, and many are armed with more advanced weapons.",
      cn_desc: "虽然波克布林总体上很烦人,但黑色波克布林属于最危险的类型之一。它们极其坚韧,许多还装备着更先进的武器。"
    },
    {
      no: "106",
      name: "STALKOBLIN",
      cn: "骷髅波克布林",
      img: "stalkoblin.png",
      got: true,
      meta: ["出没", "Hyrule Field"],
      desc: "The remains of Bokoblins appear in the dark of the night. While they're fragile enough to crumble from a single blow, as long as a skull remains intact, they'll continue to pull themselves back together and go on fighting. Sometimes the body will pick up the wrong skull, but this doesn't seem to be a problem...",
      cn_desc: "波克布林的遗骸在夜晚现身。虽然它们脆弱到一击就会崩塌,但只要头骨保持完整,它们就会不断重组并继续战斗。有时身体会捡错头骨,但这似乎不是问题……"
    },
    {
      no: "107",
      name: "SILVER BOKOBLIN",
      cn: "白银波克布林",
      img: "silver_bokoblin.png",
      got: true,
      desc: "You would be foolish to call these Silver Bokoblins a mere nuisance. They have been influenced by Ganon's fiendish magic, so they are stronger than even the Black Bokoblins. They're called \"silver\" not only because of their coloring but also to denote their rarity. The purple markings help them to stand out even more.",
      cn_desc: "如果还把白银波克布林当作普通麻烦,那你可就太蠢了。它们受到了盖侬邪恶魔法的影响,比黑色波克布林还要强大。被称为「白银」不仅因为体色,也为了彰显其稀有。紫色的花纹让它们更加醒目。"
    },
    {
      no: "108",
      name: "MOBLIN",
      cn: "莫力布林",
      img: "moblin.png",
      got: true,
      meta: ["出没", "Hyrule Field"],
      desc: "This heavyweight species of monster can be found all over Hyrule. They're physically very strong, their legs along strong enough to resist the force of a bomb blast. They're much more dangerous than the Bokoblins. In fact, Moblins have been known to pick up Bokoblins and throw them as makeshift projectile weapons.",
      cn_desc: "这种重量级怪物遍布海拉鲁各地。它们体格极其强壮,双腿的力量足以抵御炸弹爆炸的冲击。它们比波克布林危险得多。事实上,曾有莫力布林抓起波克布林,当作临时投掷武器扔出去。"
    },
    {
      no: "109",
      name: "BLUE MOBLIN",
      cn: "蓝色莫力布林",
      img: "blue_moblin.png",
      got: true,
      meta: ["出没", "Hyrule Field"],
      desc: "These heavyweight monsters can be found all over Hyrule. They're much tougher than their standard counterparts and often have much stronger weapons equipped.",
      cn_desc: "这种重量级怪物遍布海拉鲁各地。它们比普通同类坚韧得多,往往装备着更强力的武器。"
    },
    {
      no: "110",
      name: "BLACK MOBLIN",
      cn: "黑色莫力布林",
      img: "black_moblin.png",
      got: true,
      meta: ["出没", "Hyrule Field"],
      desc: "These heavyweight monsters can be found all over Hyrule and are among the most dangerous types of Moblin. They're extremely resilient and are often armed with some of the strongest weapons Moblins can carry.",
      cn_desc: "这种重量级怪物遍布海拉鲁各地,属于最危险的莫力布林类型。它们极其坚韧,常常装备着莫力布林能携带的最强武器。"
    },
    {
      no: "111",
      name: "STALMOBLIN",
      cn: "骷髅莫力布林",
      img: "stalmoblin.png",
      got: true,
      meta: ["出没", "Great Hyrule Forest"],
      desc: "The remains of Moblins appear in the dark of the night. Even the toughest Moblins become fragile when they're little more than a pile of bones, so they'll crumble after just a few attacks. However, as long as a skull remains intact, they'll continue to pull themselves back together and go on fighting.",
      cn_desc: "莫力布林的遗骸在夜晚现身。即使最强壮的莫力布林,一旦变成一堆骨头也会变得脆弱,只需几次攻击就会崩塌。但只要头骨保持完整,它们就会不断重组并继续战斗。"
    },
    {
      no: "112",
      name: "SILVER MOBLIN",
      cn: "白银莫力布林",
      img: "silver_moblin.png",
      got: true,
      desc: "The strongest of all Moblins, Ganon's fiendish magic has allowed them to surpass even the Black Moblins in strength and resilience. They're called \"silver\" for both their body color as well as their rarity. The purple patterns on their bodies also help them to stand out.",
      cn_desc: "所有莫力布林中最强的存在,盖侬的邪恶魔法使它们在力量和韧性上都超越了黑色莫力布林。被称为「白银」既是因为体色,也是因为稀有。它们身上的紫色图案也让它们格外醒目。"
    },
    {
      no: "113",
      name: "LIZALFOS",
      cn: "蜥蜴战士",
      img: "lizalfos.png",
      got: true,
      meta: ["出没", "Lanayru Great Spring"],
      desc: "These quick-witted, lizard-like monsters can be found all over Hyrule. They're a sly species that lurks underwater or uses camouflage to blend in with the environment to launch ambushes. Moreover, they never sleep. They're meat eaters by nature but will enjoy the occasional insect or two.",
      cn_desc: "这些机敏的蜥蜴状怪物遍布海拉鲁各地。它们是狡猾的物种,潜伏在水下或用伪装融入环境发动伏击。而且它们从不睡觉。它们天生是肉食动物,但偶尔也喜欢尝尝昆虫。"
    },
    {
      no: "114",
      name: "BLUE LIZALFOS",
      cn: "蓝色蜥蜴战士",
      img: "blue_lizalfos.png",
      got: true,
      meta: ["出没", "Tabantha Frontier"],
      desc: "These quick-witted, lizard-like monsters can be found all over Hyrule. Compared to the green Lizalfos, many of these carry much stronger weapons and are generally much tougher.",
      cn_desc: "这些机敏的蜥蜴状怪物遍布海拉鲁各地。与绿色蜥蜴战士相比,许多蓝色蜥蜴战士携带强得多的武器,整体也坚韧得多。"
    },
    {
      no: "115",
      name: "BLACK LIZALFOS",
      cn: "黑色蜥蜴战士",
      img: "black_lizalfos.png",
      got: true,
      meta: ["出没", "Hyrule Field"],
      desc: "These quick-witted, lizard-like monsters can be found all over Hyrule. This particular type tends to carry some pretty strong weapons, so they are among the most dangerous Lizalfos.",
      cn_desc: "这些机敏的蜥蜴状怪物遍布海拉鲁各地。这种类型往往携带相当强力的武器,属于最危险的蜥蜴战士。"
    },
    {
      no: "116",
      name: "STALIZALFOS",
      cn: "骷髅蜥蜴战士",
      img: "stalizalfos.png",
      got: true,
      meta: ["出没", "Gerudo Desert"],
      desc: "The remains of Lizalfos appear in the dark of night. They're as sly as ever, even now that they're just some bones stacked atop each other. However, their bodies are much more fragile, and a single solid hit can reduce them to pieces. If a skull remains intact, they will pull themselves back up and continue to fight. They've been known to grab the wrong skull at times, but they never seem to mind...",
      cn_desc: "蜥蜴战士的遗骸在夜晚现身。即使现在只是堆叠在一起的骨头,它们依然一如既往地狡猾。不过它们的身体脆弱得多,一记结实的攻击就能将其击碎。只要头骨保持完整,它们就会重新爬起来继续战斗。有时它们会抓错头骨,但似乎从不介意……"
    },
    {
      no: "117",
      name: "FIRE-BREATH LIZALFOS",
      cn: "吐火蜥蜴战士",
      img: "fire-breath_lizalfos.png",
      got: true,
      meta: ["出没", "Eldin Canyon"],
      desc: "These quick-witted, lizard-like monsters can be found all over Hyrule. Their fiery breath makes them pretty dangerous, but exposure to cold will kill them instantly. They mainly make their homes in volcanic areas but have also been sighted in the Akkala region.",
      cn_desc: "这些机敏的蜥蜴状怪物遍布海拉鲁各地。它们喷吐的火焰相当危险,但遇到寒冷会立即死亡。它们主要栖息于火山地区,在阿卡莱地区也有目击记录。"
    },
    {
      no: "118",
      name: "ICE-BREATH LIZALFOS",
      cn: "吐冰蜥蜴战士",
      img: "ice-breath_lizalfos.png",
      got: true,
      meta: ["出没", "Gerudo Highlands"],
      desc: "These quick-witted, lizard-like monsters can be found all over Hyrule. The balls of ice they spit make them particularly troublesome, but exposure to fire will kill them instantly. Their homes are mainly on snowy mountains.",
      cn_desc: "这些机敏的蜥蜴状怪物遍布海拉鲁各地。它们吐出的冰球特别麻烦,但遇到火焰会立即死亡。它们的巢穴主要位于雪山。"
    },
    {
      no: "119",
      name: "ELECTRIC LIZALFOS",
      cn: "电蜥蜴战士",
      img: "electric_lizalfos.png",
      got: true,
      meta: ["出没", "Gerudo Desert"],
      desc: "These quick-witted, lizard-like monsters can be found all over Hyrule. The can emit strong electrical currents from their bodies, so don't get too close. Their horns are brimming with electricity, which will discharge and arc to nearby areas if struck by an arrow. They tend to live in desert climates.",
      cn_desc: "这些机敏的蜥蜴状怪物遍布海拉鲁各地。它们能从身体释放强大的电流,所以别靠太近。它们的角充满电,被箭击中时电会释放并波及周围。它们往往生活在沙漠气候中。"
    },
    {
      no: "120",
      name: "SILVER LIZALFOS",
      cn: "白银蜥蜴战士",
      img: "silver_lizalfos.png",
      got: true,
      desc: "These Lizalfos have been influenced by Ganon's fiendish magic to become the strongest Lizalfos of all. They're called \"silver\" for their unique coloring and also to denote their rarity. Their purple pattern makes them even more distinct.",
      cn_desc: "这些蜥蜴战士受到盖侬邪恶魔法的影响,成为所有蜥蜴战士中最强的存在。被称为「白银」是因为独特的体色,也是为了彰显稀有。紫色的花纹让它们更加显眼。"
    },
    {
      no: "121",
      name: "LYNEL",
      cn: "莱尼尔",
      img: "lynel.png",
      got: true,
      meta: ["出没", "Lanayru Great Spring"],
      desc: "These fearsome monsters have lived in Hyrule since ancient times. They possess intense intelligence, resilience, and strength, making them among the most dangerous monsters in all the land. This is compounded by the fact that they have a natural resistance to all elements. You would be wise to challenge a Lynel only if you're very well prepared.",
      cn_desc: "这些可怕的怪物自远古时代就生活在海拉鲁。它们拥有极高的智慧、韧性和力量,是全大陆最危险的怪物之一。更棘手的是,它们对一切元素都具有天然抗性。若非准备充分,最好不要向莱尼尔发起挑战。"
    },
    {
      no: "122",
      name: "BLUE-MANED LYNEL",
      cn: "蓝鬃莱尼尔",
      img: "blue-maned_lynel.png",
      got: true,
      meta: ["出没", "Hyrule Field"],
      desc: "These fearsome monsters have lived in Hyrule since ancient times. Compared to the standard Lynel, those with blue manes much tougher and equipped with much stronger weapons. Facing off against a Lynel is ill-advised, but if you must, be sure you're well prepared.",
      cn_desc: "这些可怕的怪物自远古时代就生活在海拉鲁。与普通莱尼尔相比,蓝鬃莱尼尔坚韧得多,装备着强得多的武器。与莱尼尔正面交锋并非明智之举,但如果非打不可,务必做好充分准备。"
    },
    {
      no: "123",
      name: "WHITE-MANED LYNEL",
      cn: "白鬃莱尼尔",
      img: "white-maned_lynel.png",
      got: true,
      meta: ["出没", "Hyrule Field"],
      desc: "These fearsome monsters have lived in Hyrule since ancient times. Their ability to breathe fire makes White-Maned Lynels among the toughest of the species; each one of their attacks is an invitation to the grave. There are so few eyewitness accounts of this breed because a White-Maned Lynel is not one to let even simple passersby escape with their lives.",
      cn_desc: "这些可怕的怪物自远古时代就生活在海拉鲁。喷火能力使白鬃莱尼尔成为同类中最难缠的;它们每次攻击都是通往坟墓的邀请。这个品种鲜有目击者,因为白鬃莱尼尔连路过的普通人也不会放过。"
    },
    {
      no: "124",
      name: "SILVER LYNEL",
      cn: "白银莱尼尔",
      img: "silver_lynel.png",
      got: true,
      desc: "Silver Lynels are not to be trifled with. They have been influenced by Ganon's fiendish magic, so they are the strongest among the Lynel species, surpassing even the strength of those with white manes. The term \"silver\" denotes not only their color but also their rarity. The purple stripes help them to stand out even more.",
      cn_desc: "白银莱尼尔绝非可以轻视的对象。它们受到盖侬邪恶魔法的影响,是莱尼尔一族中最强的存在,甚至超越了白鬃个体。「白银」不仅指它们的体色,也彰显其稀有。紫色的条纹让它们更加醒目。"
    },
    {
      no: "125",
      name: "GUARDIAN STALKER",
      cn: "守护者(步行型)",
      img: "guardian_stalker.png",
      got: true,
      meta: ["出没", "Hyrule Field"],
      desc: "The Sheikah of ancient Hyrule developed this as a weapon to combat Ganon. Its six legs give it extraordinary mobility compared to most current vehicles, and its powerful laser provides far greater offensive capability than conventional weaponry. Destroying the legs severely reduces its mobility.",
      cn_desc: "古代海拉鲁的希卡族开发了这种武器来对抗盖侬。它的六条腿赋予它远超大多数现代交通工具的机动性,强大的激光则提供了远超常规武器的攻击能力。破坏腿部会大幅降低它的机动性。"
    },
    {
      no: "126",
      name: "GUARDIAN SKYWATCHER",
      cn: "守护者(飞天型)",
      img: "guardian_skywatcher.png",
      got: true,
      meta: ["出没", "Hyrule Field"],
      desc: "The Sheikah of ancient Hyrule developed this as a weapon to combat Ganon. This flying model is an improvement over the walking type, capable of either attacking or surveying from the air. Destroying the propeller will ground it.",
      cn_desc: "古代海拉鲁的希卡族开发了这种武器来对抗盖侬。这种飞行型号是步行型号的改进版,能够在空中攻击或侦察。破坏螺旋桨会让它坠地。"
    },
    {
      no: "127",
      name: "GUARDIAN TURRET",
      cn: "守护者(炮台型)",
      img: "guardian_turret.png",
      got: true,
      meta: ["出没", "Hyrule Castle"],
      desc: "The Sheikah of ancient Hyrule developed this as a weapon to combat Ganon. This stationary model was used for defending important structures. Its offensive power is on par with other Guardians, and omitting the legs kept the manufacturing costs low.",
      cn_desc: "古代海拉鲁的希卡族开发了这种武器来对抗盖侬。这种固定型号用于防御重要建筑。它的攻击力与其他守护者相当,省略腿部降低了制造成本。"
    },
    {
      no: "128",
      name: "SENTRY",
      cn: "守护者哨兵",
      img: "sentry.png",
      got: true,
      meta: ["出没", "Death Mountain"],
      desc: "These sentries dispatched from Divine Beast Vah Rudania are equipped with searchlights that can spot intruders.",
      cn_desc: "这些从神兽瓦·鲁达尼亚派出的哨兵配备探照灯,可以发现入侵者。"
    },
    {
      no: "129",
      name: "DECAYED GUARDIAN",
      cn: "残破守护者",
      img: "decayed_guardian.png",
      got: true,
      meta: ["出没", "Hyrule Field"],
      desc: "The Sheikah of ancient Hyrule developed this as a weapon to combat Ganon, but it was destroyed during the Great Calamity. Ages of weather and neglect have left it in a state of disrepair. Approach with caution; some of the derelict models have been known to awaken from stasis and attack when approached.",
      cn_desc: "古代海拉鲁的希卡族开发了这种武器来对抗盖侬,但它在大灾厄中被摧毁。长年风吹雨打和无人维护,使它处于破败状态。接近时务必小心;有些废弃型号在有人靠近时会从待机中苏醒并发起攻击。"
    },
    {
      no: "130",
      name: "GUARDIAN SCOUT I",
      cn: "守护者侦察机 I",
      img: "guardian_scout_i.png",
      got: true,
      desc: "Guardians were originally designed by an ancient civilization to combat Ganon, but these smaller models were placed inside shrines as part of the trials found within. The multiple legs and beam functionality were scaled down but kept mostly intact.",
      cn_desc: "守护者最初由古代文明设计用于对抗盖侬,但这些小型型号被安置在神庙内,作为试炼的一部分。多足和光束功能被缩小,但大体保留。"
    },
    {
      no: "131",
      name: "GUARDIAN SCOUT II",
      cn: "守护者侦察机 II",
      img: "guardian_scout_ii.png",
      got: true,
      desc: "Although originally designed by an ancient civilization to combat Ganon, these scaled-down Guardians were placed inside shrines as part of the trials. In additional to the beam functionality, this particular model was designed to handle weaponry as a means of further testing the combat prowess of one undertaking the trials. It takes some serious skill to go toe-to-toe with one of these.",
      cn_desc: "虽然最初由古代文明设计用于对抗盖侬,但这些缩小版守护者被安置在神庙内作为试炼内容。除光束功能外,这一型号还专门设计为可操控武器,以进一步考验试炼者的战斗能力。要与之势均力敌需要相当高超的技艺。"
    },
    {
      no: "132",
      name: "GUARDIAN SCOUT III",
      cn: "守护者侦察机 III",
      img: "guardian_scout_iii.png",
      got: true,
      desc: "Although originally designed by an ancient civilisation to combat Ganon, these scaled-down Guardians were placed inside shrines as part or the trials. This model is equipped with twin-blade functionality to further test the combat prowess of one undertaking the trials. It takes a nimble fighter to overcome this one.",
      cn_desc: "虽然最初由古代文明设计用于对抗盖侬,但这些缩小版守护者被安置在神庙内作为试炼内容。这一型号配备双剑功能,以进一步考验试炼者的战斗能力。只有身手敏捷的战士才能战胜它。"
    },
    {
      no: "133",
      name: "GUARDIAN SCOUT IV",
      cn: "守护者侦察机 IV",
      img: "guardian_scout_iv.png",
      got: true,
      desc: "An ancient civilization originally designed Guardians to combat Ganon but then scaled them down to place in shrines as part of the trials. This model is very resilient and has been outfitted with triple-blade functionality, allowing it to wield three weapons. This will put any would-be hero to the test for sure. A great deal of strength and confidence alike are required to contend with one of these.",
      cn_desc: "古代文明最初设计守护者用于对抗盖侬,后来将其缩小并安置在神庙内作为试炼内容。这一型号非常坚韧,配备三剑功能,可以挥舞三件武器。这绝对会让任何想成为英雄的人接受考验。要与之对抗,需要极大的力量和自信。"
    },
    {
      no: "134",
      name: "YIGA FOOTSOLDIER",
      cn: "依盖队小兵",
      img: "yiga_footsoldier.png",
      got: true,
      desc: "The lowest-ranked members of the Yiga Clan. They've been dispatched all across Hyrule with a single task: seek out Link and end his life. They're a crafty bunch, sometimes disguising themselves as simple travelers or villagers to get the jump on you. Be wary of suspicious people you encounter. They're very agile and carry a bow and one-handed sword.",
      cn_desc: "依盖队中级别最低的成员。他们被派往海拉鲁各地执行唯一任务:找到林克并取他性命。他们狡猾得很,有时伪装成普通旅人或村民来偷袭你。要提防遇到的形迹可疑之人。他们非常敏捷,随身携带弓和单手剑。"
    },
    {
      no: "135",
      name: "YIGA BLADEMASTER",
      cn: "依盖队刀手",
      img: "yiga_blademaster.png",
      got: true,
      desc: "These are the elite soldiers of the Yiga Clan. They favor the windcleaver blade and are extremely agile despite their bulky build. At this Yiga Clan rank, they have mastered a technique that allows them to manipulate the very earth. By striking the ground, they can create stone pillars and blasts of air.",
      cn_desc: "他们是依盖队的精英战士。他们偏爱斩风刀,尽管体格壮硕却极其敏捷。在这个级别的依盖队成员中,他们掌握了一种能操控大地的技巧。通过击打地面,他们能制造石柱和气流。"
    },
    {
      no: "136",
      name: "MASTER KOHGA",
      cn: "可盖大人",
      img: "master_kohga.png",
      got: true,
      meta: ["出没", "Yiga Clan Hideout"],
      desc: "The leader of the Yiga Clan, a group formed with just a single objective: eliminate Link. He sends his minions all over Hyrule in search of you but tends to spend most of his time napping and generally loafing about. Despite this, his mastery of the esoteric arts has earned him a deep respect. Even if he were to die, his followers would never give up on their one and only task.",
      cn_desc: "依盖队的首领,这个组织的唯一目标就是:除掉林克。他派手下在海拉鲁各地搜寻你,自己却大部分时间都在打盹、无所事事。尽管如此,他对秘术的精通赢得了部下深深的敬重。即使他死了,他的追随者也绝不会放弃那唯一的目标。"
    },
    {
      no: "137",
      name: "MONK MAZ KOSHIA",
      cn: "马兹·柯西亚大师",
      img: "monk_maz_koshia.png",
      got: true,
      desc: "The arbiter of worthiness for the hero who wishes to control a Divine Beast, following a revelation from the Goddess Hylia. As the last part of the final trial, the monk offers a challenge of ancient techniques.",
      cn_desc: "遵照海利亚女神的启示,负责判定勇者是否有资格操控神兽的仲裁者。作为最终试炼的最后一部分,这位僧侣发起了古代技艺的挑战。"
    },
    {
      no: "138",
      name: "STONE TALUS",
      cn: "岩石巨人",
      img: "stone_talus.png",
      got: true,
      meta: ["出没", "West Necluda"],
      desc: "This enormous monster is naturally camouflaged as a rock formation. Neither sword nor arrow can pierce its stony form, but a cunning adventurer knows to scale its body and attack the ore sprouting from its peak.",
      cn_desc: "这种巨型怪物天生伪装成岩层。刀剑和弓箭都无法穿透它岩石的身躯,但聪明的冒险者知道爬上它的身体,攻击从它顶端长出的矿石。"
    },
    {
      no: "139",
      name: "STONE TALUS (LUMINOUS)",
      cn: "岩石巨人(夜光)",
      img: "stone_talus_(luminous).png",
      got: true,
      meta: ["出没", "Gerudo Highlands"],
      desc: "This enormous monster is naturally camouflaged as a rock formation. Neither sword nor arrow can pierce its stony form, but a cunning adventurer knows to scale its body and attack the ore sprouting from its peak. Unlike your average Stone Talus, this type's ore deposit consists mostly of luminous stone.",
      cn_desc: "这种巨型怪物天生伪装成岩层。刀剑和弓箭都无法穿透它岩石的身躯,但聪明的冒险者知道爬上它的身体,攻击从它顶端长出的矿石。与普通岩石巨人不同,这种类型的矿石主要由夜光石构成。"
    },
    {
      no: "140",
      name: "STONE TALUS (RARE)",
      cn: "岩石巨人(稀有)",
      img: "stone_talus_(rare).png",
      got: true,
      meta: ["出没", "Hyrule Field"],
      desc: "This enormous monster is naturally camouflaged as a rock formation. Neither stone nor arrow can pierce its stony form, but a cunning adventurer knows to scale its body and attack the ore sprouting from its peak. Unlike your average Stone Talus, this type's ore deposit contains a large amount of precious ore.",
      cn_desc: "这种巨型怪物天生伪装成岩层。刀剑和弓箭都无法穿透它岩石的身躯,但聪明的冒险者知道爬上它的身体,攻击从它顶端长出的矿石。与普通岩石巨人不同,这种类型的矿石含有大量珍贵矿石。"
    },
    {
      no: "141",
      name: "IGNEO TALUS",
      cn: "熔岩巨人",
      img: "igneo_talus.png",
      got: true,
      meta: ["出没", "Eldin Canyon"],
      desc: "This enormous monster is naturally camouflaged as molten rock. Neither sword nor arrow can pierce its fiery form. Merely touching its magma-hot body can burn you pretty badly, but you may be able to scale it if you can use something to chill its flames.",
      cn_desc: "这种巨型怪物天生伪装成熔岩。刀剑和弓箭都无法穿透它燃烧的身躯。仅仅触碰它岩浆般滚烫的身体就会严重灼伤,但如果能找到什么东西冷却它的火焰,也许就能爬上去。"
    },
    {
      no: "142",
      name: "FROST TALUS",
      cn: "冰岩巨人",
      img: "frost_talus.png",
      got: true,
      meta: ["出没", "Hebra Mountains"],
      desc: "This enormous monster is naturally camouflaged as a frozen rock formation. Neither sword nor arrow can pierce its frigid form. Merely touching its frosty body can leave you with severe frostbite, but you may be able to scale it if you use something to thaw its icy exterior.",
      cn_desc: "这种巨型怪物天生伪装成冰冻岩层。刀剑和弓箭都无法穿透它冰冷的身躯。仅仅触碰它冰霜覆盖的身体就会造成严重冻伤,但如果能用什么东西融化它冰封的外壳,也许就能爬上去。"
    },
    {
      no: "143",
      name: "STONE PEBBLIT",
      cn: "岩石小宝",
      img: "stone_pebblit.png",
      got: true,
      meta: ["出没", "Greater Hyrule"],
      desc: "A very young Stone Talus. Their bodies toughen as they mature, becoming as tough as boulders by adulthood. As a child, however, their bodies are light enough to be lifted and fragile enough to break when thrown.",
      cn_desc: "非常年幼的岩石巨人。它们成熟后身体会变得坚韧,成年时坚硬如巨石。但幼年时,它们的身体轻到可以被举起,脆弱到被扔出就会摔碎。"
    },
    {
      no: "144",
      name: "IGNEO PEBBLIT",
      cn: "熔岩小宝",
      img: "igneo_pebblit.png",
      got: true,
      meta: ["出没", "Eldin Canyon"],
      desc: "A very young Igneo Talus. Their bodies toughen as they mature and convert fully into lava by adulthood. As a child, however, while still covered in fire, their bodies are fragile and light enough to be blown away by a bomb's blast.",
      cn_desc: "非常年幼的熔岩巨人。它们成熟后身体会变得坚韧,成年时完全化为熔岩。但幼年时,虽然身上还覆着火焰,它们的身体却脆弱轻盈,会被炸弹爆炸的气浪吹飞。"
    },
    {
      no: "145",
      name: "FROST PEBBLIT",
      cn: "冰岩小宝",
      img: "frost_pebblit.png",
      got: true,
      meta: ["出没", "Hebra Mountains"],
      desc: "A very young Frost Talus. Their bodies toughen and frost over as they mature, becoming entirely made of ice by adulthood. As a child, however, their bodies are awfully fragile and are light enough to be blown away by a bomb's blast.",
      cn_desc: "非常年幼的冰岩巨人。它们成熟后身体会变得坚韧并结霜,成年时完全由冰构成。但幼年时,它们的身体相当脆弱,轻盈到会被炸弹爆炸的气浪吹飞。"
    },
    {
      no: "146",
      name: "IGNEO TALUS TITAN",
      cn: "熔岩巨神",
      img: "igneo_talus_titan.png",
      got: true,
      desc: "This monster is an Igneo Talus subspecies that is camouflaged as molten rock. It lives in lava for many years before emerging at an enormous size. It is wildly powerful and emits a tremendous amount of heat, causing a constant updraft in its vicinity. This monster is so fearsome it has earned the title of Titan.",
      cn_desc: "这种怪物是伪装成熔岩的熔岩巨人亚种。它在岩浆中生活多年后,以巨大的体型现身。它力量狂暴,散发出巨量热量,导致周围持续产生上升气流。这怪物如此可怖,以至于赢得了「泰坦」的称号。"
    },
    {
      no: "147",
      name: "HINOX",
      cn: "西诺克斯",
      img: "hinox.png",
      got: true,
      meta: ["出没", "East Necluda"],
      desc: "The largest monster to make its home in Hyrule, the Hinox lives primarily in forested areas. A keen awareness of your surroundings is paramount when facing one, as Hinox are known for tearing entire trees from the ground and using them as weapons. A deft hand can steal weapons off the necklaces they wear.",
      cn_desc: "栖息于海拉鲁的最大怪物,西诺克斯主要生活在森林地区。面对它时,对周围环境保持敏锐至关重要,因为西诺克斯以把整棵树连根拔起当作武器而闻名。手法灵巧的人可以从它戴的项链上偷走武器。"
    },
    {
      no: "148",
      name: "BLUE HINOX",
      cn: "蓝色西诺克斯",
      img: "blue_hinox.png",
      got: true,
      meta: ["出没", "Hyrule Field"],
      desc: "The largest monster to make its home in Hyrule, the Hinox lives primarily in forested areas. A keen awareness of your surroundings is paramount when facing one, as Hinox are known for tearing entire trees from the ground and using them as weapons. Blue Hinox wear greaves that can be burnt away to expose their feet. A deft hand can steal weapons off the necklaces they wear.",
      cn_desc: "栖息于海拉鲁的最大怪物,西诺克斯主要生活在森林地区。面对它时,对周围环境保持敏锐至关重要,因为西诺克斯以把整棵树连根拔起当作武器而闻名。蓝色西诺克斯穿着护胫,烧掉护胫就能露出它们的脚。手法灵巧的人可以从它戴的项链上偷走武器。"
    },
    {
      no: "149",
      name: "BLACK HINOX",
      cn: "黑色西诺克斯",
      img: "black_hinox.png",
      got: true,
      meta: ["出没", "East Necluda"],
      desc: "The largest monster to make its home in Hyrule, the Hinox lives primarily in forested areas. A keen awareness of your surroundings is paramount when facing one, as Hinox are known for tearing entire trees from the ground and using them as weapons. Black Hinox wear metal greaves that conduct electricity rather well. A deft hand can steal weapons off the necklaces they wear.",
      cn_desc: "栖息于海拉鲁的最大怪物,西诺克斯主要生活在森林地区。面对它时,对周围环境保持敏锐至关重要,因为西诺克斯以把整棵树连根拔起当作武器而闻名。黑色西诺克斯穿着导电良好的金属护胫。手法灵巧的人可以从它戴的项链上偷走武器。"
    },
    {
      no: "150",
      name: "STALNOX",
      cn: "骷髅西诺克斯",
      img: "stalnox.png",
      got: true,
      meta: ["出没", "Hyrule Field"],
      desc: "The mere remains of what was once a giant monster known as a Hinox. These skeletal beasts appear at nighttime. Much like their living counterparts, the Stalnox will tear entire trees from the ground to use as weapons. Furthermore, even if it appears defeated at first, it will keep coming back for more as long as its eye is left intact.",
      cn_desc: "曾经被称为西诺克斯的巨型怪物遗留下来的残骸。这些骷髅野兽在夜间出现。与它们活着的同类一样,骷髅西诺克斯会把整棵树连根拔起当作武器。而且,即使它一开始看似被击败,只要眼睛完好,它就会不断卷土重来。"
    },
    {
      no: "151",
      name: "MOLDUGA",
      cn: "莫尔德拉吉克",
      img: "molduga.png",
      got: true,
      meta: ["出没", "Gerudo Desert"],
      desc: "This massive monster swims beneath the desert's sand. It spends most of its time submerged, but if it senses sound, it will breach the surface to feast on whatever it can grab. Running around carelessly can be dangerous if you suspect there may be one in the area.",
      cn_desc: "这种巨型怪物在沙漠的沙地之下游弋。它大部分时间潜行于沙中,但一旦感知到声音,就会破沙而出,吞噬任何能抓住的东西。若怀疑附近有它出没,四处乱跑会很危险。"
    },
    {
      no: "152",
      name: "MOLDUKING",
      cn: "莫尔德拉吉克王",
      img: "molduking.png",
      got: true,
      desc: "This massive monster swims beneath the desert's sand. It is a subspecies of Molduga that stored up a great deal of energy by sleeping underground for hundreds of years. Its power is superior to Molduga, as its skin is rich with iron and acts as a protective shield.",
      cn_desc: "这种巨型怪物在沙漠的沙地之下游弋。它是莫尔德拉吉克的亚种,在地下沉睡了数百年,积蓄了大量能量。它的力量胜过普通莫尔德拉吉克,皮肤富含铁质,如同一层防护盾。"
    },
    {
      no: "153",
      name: "DINRAAL",
      cn: "奥尔龙",
      img: "dinraal.png",
      got: true,
      meta: ["出没", "Eldin Mountains"],
      desc: "A spirit of fire has taken the form of this giant dragon. Making its home in the Eldin region, it's said to have served the Spring of Power since ancient times. An old saying goes, \"The dragon ascends to the heavens as the sun begins to set,\" but nobody has witnessed this in the current age. The flames that coat its body make it dangerous to get near, but Dinraal bears no ill will toward people.",
      cn_desc: "火之精灵化作了这条巨龙的形态。它栖息于埃尔丁地区,据说自远古时代起就侍奉着力量之泉。古谚有云:「巨龙在夕阳西下时升入天际「,但在当世无人亲眼目睹。覆盖全身的火焰使靠近它变得危险,但奥尔龙对人类并无恶意。"
    },
    {
      no: "154",
      name: "NAYDRA",
      cn: "奥拉龙",
      img: "naydra.png",
      got: true,
      meta: ["出没", "Mount Lanayru"],
      desc: "A spirit of ice has taken the form of this giant dragon. Making its home in the Lanayru region, it's said to have served the Spring of Wisdom since ancient times. An old saying goes, \"The dragon ascends to the heavens as the sun begins to set,\" but nobody has seen this in the current age. The ice that coats its body makes it dangerous to get near, but Naydra bears no ill will toward people.",
      cn_desc: "冰之精灵化作了这条巨龙的形态。它栖息于拉聂耳地区,据说自远古时代起就侍奉着智慧之泉。古谚有云:「巨龙在夕阳西下时升入天际「,但在当世无人亲眼目睹。覆盖全身的寒冰使靠近它变得危险,但奥拉龙对人类并无恶意。"
    },
    {
      no: "155",
      name: "FAROSH",
      cn: "奥夫龙",
      img: "farosh.png",
      got: true,
      meta: ["出没", "Lake Hylia"],
      desc: "A spirit of lightning has taken the form of this giant dragon. Making its home in the Faron region, it's said to have served the Spring of Courage since ancient times. An old saying goes, \"The dragon ascends to the heavens as the sun begins to set,\" but nobody has seen this in the current age. The electricity that coats its body makes it dangerous to get near, but Farosh bears no ill will toward people.",
      cn_desc: "雷电之精灵化作了这条巨龙的形态。它栖息于费罗尼地区,据说自远古时代起就侍奉着勇气之泉。古谚有云:「巨龙在夕阳西下时升入天际「,但在当世无人亲眼目睹。缠绕全身的电流使靠近它变得危险,但奥夫龙对人类并无恶意。"
    },
    {
      no: "156",
      name: "CURSED BOKOBLIN",
      cn: "被诅咒的波克布林",
      img: "cursed_bokoblin.png",
      got: true,
      desc: "The Malice has given these Bokoblin skulls a sort of life. Devoid of any intelligence the Bokoblin it once belonged to may have had, these pitiful things now exist only to attack anything that gets too close.",
      cn_desc: "瘴气赋予了这些波克布林头骨一种生命。这些可怜的家伙丧失了生前可能拥有的一切智慧,如今只为了攻击任何靠得太近的东西而存在。"
    },
    {
      no: "157",
      name: "CURSED MOBLIN",
      cn: "被诅咒的莫力布林",
      img: "cursed_moblin.png",
      got: true,
      desc: "The Malice has given these Moblin skulls a pitiful life after death. The only fragment of their former selves they've held on to is the ferocity innate to all Moblins, so they will attack anyone that approaches.",
      cn_desc: "瘴气在死后赋予了这些莫力布林头骨一种可悲的生命。它们保留的生前唯一片段,就是莫力布林与生俱来的凶猛,因此它们会攻击任何靠近的人。"
    },
    {
      no: "158",
      name: "CURSED LIZALFOS",
      cn: "被诅咒的蜥蜴战士",
      img: "cursed_lizalfos.png",
      got: true,
      desc: "The Malice has given these Lizalfos skulls a sorry form of life after death. Only the slyness of their former selves remains, making them faster than Bokoblin skulls. They thoughtlessly attack anyone who approaches.",
      cn_desc: "瘴气在死后赋予了这些蜥蜴战士头骨一种可悲的生命形态。它们生前仅存的狡猾使它们比波克布林头骨更快。它们会不加思考地攻击任何靠近的人。"
    },
    {
      no: "159",
      name: "THUNDERBLIGHT GANON",
      cn: "雷咒盖侬",
      img: "thunderblight_ganon.png",
      got: true,
      meta: ["出没", "Divine Beast Vah Naboris"],
      desc: "This phantom of Ganon attacked the Divine Beast Vah Naboris and was responsible for the demise of the Champion Urbosa. It specializes in quick, lightning-based attacks.",
      cn_desc: "这个盖侬幻影袭击了神兽瓦·纳波利斯,并导致了英杰乌尔波扎的陨落。它擅长快速、以雷电为基础的攻击。"
    },
    {
      no: "160",
      name: "FIREBLIGHT GANON",
      cn: "火咒盖侬",
      img: "fireblight_ganon.png",
      got: true,
      meta: ["出没", "Divine Beast Vah Rudania"],
      desc: "This phantom of Ganon attacked the Divine Beast Vah Rudania and was responsible for the demise of the Champion Daruk. It attacks with a greatsword and fire magic.",
      cn_desc: "这个盖侬幻影袭击了神兽瓦·鲁达尼亚,并导致了英杰达尔克尔之死。它使用大剑和火焰魔法攻击。"
    },
    {
      no: "161",
      name: "WATERBLIGHT GANON",
      cn: "水咒盖侬",
      img: "waterblight_ganon.png",
      got: true,
      meta: ["出没", "Divine Beast Vah Ruta"],
      desc: "This phantom of Ganon attacked the Divine Beast Vah Ruta and was responsible for the demise of the Champion Mipha. It attacks with a spear and ice magic.",
      cn_desc: "这个盖侬幻影袭击了神兽瓦·鲁塔,并导致了英杰米法的陨落。它使用长枪和冰魔法攻击。"
    },
    {
      no: "162",
      name: "WINDBLIGHT GANON",
      cn: "风咒盖侬",
      img: "windblight_ganon.png",
      got: true,
      meta: ["出没", "Divine Beast Vah Medoh"],
      desc: "This phantom of Ganon attacked the Divine Beast Vah Medoh and was responsible for the demise of the Champion Revali. It specializes in long-ranged wind attacks.",
      cn_desc: "这个盖侬幻影袭击了神兽瓦·梅德,并导致了英杰力巴尔的陨落。它擅长远距离的旋风攻击。"
    },
    {
      no: "163",
      name: "CALAMITY GANON",
      cn: "灾厄盖侬",
      img: "calamity_ganon.png",
      got: true,
      meta: ["出没", "Hyrule Castle"],
      desc: "The source of the darkness that has appeared time and again throughout Hyrule's history. It's been called many names, from \"Great King of Evil\" to \"Calamity.\" Hibernating within a cocoon, it attempted to regenerate a physical form after Link awoke but was forced to confront him in an incomplete state.",
      cn_desc: "海拉鲁历史中反复出现的黑暗之源。它有过许多名字,从「邪恶之王」到「灾厄」不一而足。它蛰伏在茧中,在林克苏醒后试图重塑肉身,却被迫以不完整的状态面对他。"
    },
    {
      no: "164",
      name: "DARK BEAST GANON",
      cn: "魔兽盖侬",
      img: "dark_beast_ganon.png",
      got: true,
      meta: ["出没", "Hyrule Field"],
      desc: "After Ganon was defeated by Link, the remaining Malice pulled itself together to form this bestial creature. Its appearance and fiendish magic eared it the name of Dark Beast. This form is considered to be Ganon's original, although in this state, his awareness has been consumed entirely by Malice, and all he knows is a desire to rampage and destroy.",
      cn_desc: "盖侬被林克击败后,残余的瘴气聚拢成形,化作了这头野兽。它的外形和邪恶魔法为它赢得了「魔兽「之名。这一形态被视为盖侬的原初形态,尽管在此状态下,他的意识已被瘴气完全吞噬,所知的只有狂暴与毁灭的欲望。"
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
      desc: "A common fruit found on trees all around Hyrule. Eat it fresh, or cook it to increase its effect.",
      cn_desc: "海拉鲁各地树上常见的果实。可以生吃,也可以烹煮以增强效果。"
    },
    {
      no: "166",
      name: "PALM FRUIT",
      cn: "棕榈果",
      img: "palm_fruit.png",
      got: true,
      meta: ["获取", "East Necluda"],
      desc: "Fruit from palm trees that grow near the ocean. It doesn't offer any special effects but will increase your heart recovery when used as an ingredient.",
      cn_desc: "海边棕榈树结的果实。虽然没有特殊效果,但作为食材可以提升心的回复量。"
    },
    {
      no: "167",
      name: "WILDBERRY",
      cn: "野莓",
      img: "wildberry.png",
      got: true,
      meta: ["获取", "Gerudo Highlands"],
      desc: "A fruit that grows in cold, snowy regions known for its tangy, sweet flavor. It doesn't offer any special effects, but it's a popular cooking ingredient.",
      cn_desc: "生长在寒冷雪地的一种果实,以酸甜的风味著称。虽然没有特殊效果,但却是受欢迎的烹饪食材。"
    },
    {
      no: "168",
      name: "HEARTY DURIAN",
      cn: "榴莲",
      img: "hearty_durian.png",
      got: true,
      meta: ["获取", "West Necluda"],
      desc: "This fruit's mighty odor has earned it the nickname \"king of fruits.\" It offers immense restorative powers; dishes cooked with it will temporarily increase your maximum hearts.",
      cn_desc: "这种果实浓郁的气味为它赢得了「水果之王」的称号。它蕴含强大的恢复力;用它烹煮的料理能暂时提升最大心数。"
    },
    {
      no: "169",
      name: "HYDROMELON",
      cn: "水瓜",
      img: "hydromelon.png",
      got: true,
      meta: ["获取", "Gerudo Desert"],
      desc: "This resilient fruit can flourish even in the heat of the desert. The hydrating liquid inside provides a cooling effect that, when cooked, increases your heat resistance.",
      cn_desc: "这种坚韧的果实即使在沙漠的酷热中也能茁壮生长。内部含有的保湿液体具有降温效果,烹煮后能提升耐热性。"
    },
    {
      no: "170",
      name: "SPICY PEPPER",
      cn: "辣椒",
      img: "spicy_pepper.png",
      got: true,
      meta: ["获取", "Gerudo Desert"],
      desc: "This pepper is exploding with spice. Cook with it to create dishes that will raise your body temperature and help you withstand the cold.",
      cn_desc: "这种辣椒辣味十足。用它烹饪能制作提升体温、抵御寒冷的料理。"
    },
    {
      no: "171",
      name: "VOLTFRUIT",
      cn: "电果",
      img: "voltfruit.png",
      got: true,
      meta: ["获取", "Gerudo Desert"],
      desc: "Cacti found in the Gerudo Desert bear this sweet fruit. It's naturally insulated, so when cooked into a dish, it provides resistance against electricity.",
      cn_desc: "格鲁德沙漠的仙人掌结出的甘甜果实。它天然绝缘,烹煮成料理后能提供耐电性。"
    },
    {
      no: "172",
      name: "FLEET-LOTUS SEEDS",
      cn: "速莲籽",
      img: "fleet-lotus_seeds.png",
      got: true,
      meta: ["获取", "Lanayru Wetlands"],
      desc: "The plant that bears these seeds grows near deep water. The roots draw nutrients from the water, which boosts your movement speed when the seeds are cooked into a dish.",
      cn_desc: "结出这种种子的植物生长在深水附近。根部从水中汲取养分,将种子烹煮成料理后能提升移动速度。"
    },
    {
      no: "173",
      name: "MIGHTY BANANAS",
      cn: "强壮香蕉",
      img: "mighty_bananas.png",
      got: true,
      meta: ["获取", "Faron"],
      desc: "This fruit grows mainly in tropical forests of the Faron region. When it's used as an ingredient, the resulting dish will temporarily increase your attack power.",
      cn_desc: "这种果实主要生长在费罗尼地区的热带森林中。用作食材时,所制料理能暂时提升攻击力。"
    },
    {
      no: "174",
      name: "HYLIAN SHROOM",
      cn: "海拉鲁蘑菇",
      img: "hylian_shroom.png",
      got: true,
      meta: ["获取", "Hyrule Field"],
      desc: "A common mushroom found near trees around Hyrule. Eat it to restore half a heart.",
      cn_desc: "海拉鲁各地树旁常见的蘑菇。食用可回复半颗心。"
    },
    {
      no: "175",
      name: "ENDURA SHROOM",
      cn: "耐力蘑菇",
      img: "endura_shroom.png",
      got: true,
      meta: ["获取", "Hyrule Ridge"],
      desc: "A rare yellowish-orange mushroom. Cook it before eating to temporarily increase your stamina limit.",
      cn_desc: "一种罕见的黄橙色蘑菇。烹煮后食用,能暂时提升精力上限。"
    },
    {
      no: "176",
      name: "STAMELLA SHROOM",
      cn: "精力蘑菇",
      img: "stamella_shroom.png",
      got: true,
      meta: ["获取", "Hyrule Ridge"],
      desc: "A green mushroom that grows near trees in the forest. It's chock-full of natural energy. Cook it to release its stamina-restoration properties.",
      cn_desc: "一种生长在森林树旁的绿色蘑菇。它充满天然能量。烹煮后能发挥其回复精力的功效。"
    },
    {
      no: "177",
      name: "HEARTY TRUFFLE",
      cn: "精力松露",
      img: "hearty_truffle.png",
      got: true,
      meta: ["获取", "Great Hyrule Forest"],
      desc: "This rare mushroom has a rich scent. Cook it before eating to temporarily increase your maximum hearts.",
      cn_desc: "这种珍稀蘑菇散发着浓郁的香气。烹煮后食用,能暂时提升最大心数。"
    },
    {
      no: "178",
      name: "BIG HEARTY TRUFFLE",
      cn: "大精力松露",
      img: "big_hearty_truffle.png",
      got: true,
      meta: ["获取", "Hebra Mountains"],
      desc: "Years of going unpicked have allowed this hearty truffle to grow quite large. It's chock- full of nutrients. When cooked into a dish, it temporarily increases your maximum hearts.",
      cn_desc: "长年无人采摘,使这种厚实的松露长得相当巨大。它营养极为丰富。烹煮成料理后,能暂时提升最大心数。"
    },
    {
      no: "179",
      name: "CHILLSHROOM",
      cn: "冷蘑菇",
      img: "chillshroom.png",
      got: true,
      meta: ["获取", "Hebra Mountains"],
      desc: "Often found at the base of pine trees in cold climates, these mushrooms are cool to the touch and can be used to cook dishes that allow you to stay cool even in arid regions.",
      cn_desc: "常见于寒冷地带松树根部,这些蘑菇触感冰凉,可用来烹饪即使在干旱地区也能保持凉爽的料理。"
    },
    {
      no: "180",
      name: "SUNSHROOM",
      cn: "日蘑菇",
      img: "sunshroom.png",
      got: true,
      meta: ["获取", "Eldin Canyon"],
      desc: "A bright red mushroom that grows in hot climates. Imbued with the power of heat, they can be used to cook dishes that will allow you endure the bitter cold.",
      cn_desc: "一种生长在炎热地带的鲜红色蘑菇。蕴含热量的它们,可用来烹饪让你抵御严寒的料理。"
    },
    {
      no: "181",
      name: "ZAPSHROOM",
      cn: "电蘑菇",
      img: "zapshroom.png",
      got: true,
      meta: ["获取", "Deep Akkala"],
      desc: "This mushroom grows wild in the Gerudo region. The cap is naturally insulated, so when used in cooking, it will offer protection against electricity.",
      cn_desc: "这种蘑菇野生于格鲁德地区。菌盖天然绝缘,用于烹饪时能提供防电保护。"
    },
    {
      no: "182",
      name: "RUSHROOM",
      cn: "灯蘑菇",
      img: "rushroom.png",
      got: true,
      meta: ["获取", "Gerudo Highlands"],
      desc: "A mushroom that can grow almost anywhere but prefers ceilings and sheer cliffs. Cook it before eating to temporarily increase your movement speed.",
      cn_desc: "一种几乎到处都能生长的蘑菇,但偏好天花板和陡峭悬崖。烹煮后食用,能暂时提升移动速度。"
    },
    {
      no: "183",
      name: "RAZORSHROOM",
      cn: "刀蘑菇",
      img: "razorshroom.png",
      got: true,
      meta: ["获取", "Great Hyrule Forest"],
      desc: "This mushroom is known for the natural slice in its cap. Eating it fosters your competitive spirit. Use it when cooking to prepare a dish that will increase your strength.",
      cn_desc: "这种蘑菇以菌盖上天然的裂口而闻名。食用它能激发竞争心。烹饪时使用它,可制作提升力量的料理。"
    },
    {
      no: "184",
      name: "IRONSHROOM",
      cn: "铁蘑菇",
      img: "ironshroom.png",
      got: true,
      meta: ["获取", "West Necluda"],
      desc: "The cap of this mushroom is very hard. Use it when cooking to prepare a dish that increases you defense.",
      cn_desc: "这种蘑菇的菌盖非常坚硬。烹饪时使用它,可制作提升防御力的料理。"
    },
    {
      no: "185",
      name: "SILENT SHROOM",
      cn: "静蘑菇",
      img: "silent_shroom.png",
      got: true,
      meta: ["获取", "Lanayru Great Spring"],
      desc: "A strange mushroom that glows softly in the forest at night. Cooking it into a dish unlocks the nutrients in its cap, resulting in a meal that will allow you to move stealthily.",
      cn_desc: "一种奇特的蘑菇,夜晚在森林中发出柔和的光。将其烹煮成料理,能释放菌盖中的营养成分,制成让你悄无声息移动的料理。"
    },
    {
      no: "186",
      name: "HYRULE HERB",
      cn: "海拉鲁药草",
      img: "hyrule_herb.png",
      got: true,
      meta: ["获取", "Hyrule Field"],
      desc: "This healthy herb grows abundantly in the plains of Hyrule. Cook it before eating to increase the number of hearts it restores.",
      cn_desc: "这种健康的药草在海拉鲁平原生长茂盛。烹煮后食用,能提升回复的心数。"
    },
    {
      no: "187",
      name: "HEARTY RADISH",
      cn: "精力萝卜",
      img: "hearty_radish.png",
      got: true,
      meta: ["获取", "Hyrule Ridge"],
      desc: "A rare radish that grows best in sunny plains. Cook it before eating to temporarily increase your maximum hearts.",
      cn_desc: "一种珍稀萝卜,在阳光充足的平原上生长最佳。烹煮后食用,能暂时提升最大心数。"
    },
    {
      no: "188",
      name: "BIG HEARTY RADISH",
      cn: "大精力萝卜",
      img: "big_hearty_radish.png",
      got: true,
      meta: ["获取", "Akkala Highlands"],
      desc: "This hearty radish has grown much larger than the average radish. It's rich in analeptic compounds that, when cooked into a dish, temporarily increase your maximum hearts.",
      cn_desc: "这种厚实的萝卜比普通萝卜大得多。它富含强身成分,烹煮成料理后,能暂时提升最大心数。"
    },
    {
      no: "189",
      name: "COOL SAFFLINA",
      cn: "清凉红花",
      img: "cool_safflina.png",
      got: true,
      meta: ["获取", "Hebra Mountains"],
      desc: "This medicinal plant grows in high elevations, such as mountains in the Hebra or Gerudo regions. When cooked into a dish, it will temporarily increase your heat resistance.",
      cn_desc: "这种药用植物生长在海拔高的地方,如海布拉或格鲁德地区的群山。烹煮成料理后,能暂时提升耐热性。"
    },
    {
      no: "190",
      name: "WARM SAFFLINA",
      cn: "温暖红花",
      img: "warm_safflina.png",
      got: true,
      meta: ["获取", "Gerudo Desert"],
      desc: "This medicinal plant grows in hot regions, such as the Gerudo Desert. It's warm to the touch and increases your cold resistance when cooked into a dish.",
      cn_desc: "这种药用植物生长在格鲁德沙漠等炎热地区。它触感温暖,烹煮成料理后能提升抗寒能力。"
    },
    {
      no: "191",
      name: "ELECTRIC SAFFLINA",
      cn: "电红花",
      img: "electric_safflina.png",
      got: true,
      meta: ["获取", "Gerudo Desert"],
      desc: "This medicinal plant grows abundantly in the Gerudo Desert. Its peculiar fibers conduct electricity, which will increase your electricity resistance when cooked into a dish.",
      cn_desc: "这种药用植物在格鲁德沙漠生长繁茂。它独特的纤维能导电,烹煮成料理后能提升耐电性。"
    },
    {
      no: "192",
      name: "SWIFT CARROT",
      cn: "速胡萝卜",
      img: "swift_carrot.png",
      got: true,
      meta: ["获取", "Kakariko Village"],
      desc: "This carrot is cultivated extensively in Kakariko Village. It strengthens the legs and hips when cooked into a dish, which helps increase your movement speed.",
      cn_desc: "这种胡萝卜在卡卡利科村被广泛种植。烹煮成料理后能强健腿脚,帮助提升移动速度。"
    },
    {
      no: "193",
      name: "ENDURA CARROT",
      cn: "耐力胡萝卜",
      img: "endura_carrot.png",
      got: true,
      meta: ["获取", "Hyrule Ridge"],
      desc: "Highly valued as a medicinal plant, this carrot contains large amounts of nourishing energy. When cooked into a dish, it boosts your stamina beyond its maximum limit.",
      cn_desc: "作为药用植物备受珍视,这种胡萝卜含有大量滋养能量。烹煮成料理后,能让精力超越上限。"
    },
    {
      no: "194",
      name: "FORTIFIED PUMPKIN",
      cn: "装甲南瓜",
      img: "fortified_pumpkin.png",
      got: true,
      meta: ["获取", "Kakariko Village"],
      desc: "An extremely tough pumpkin raised in village fields. When cooked, that toughness manifests itself by considerably upping defense.",
      cn_desc: "村庄田地里培育的极硬南瓜。烹煮后,那种坚硬会转化为效果,大幅提升防御力。"
    },
    {
      no: "195",
      name: "SWIFT VIOLET",
      cn: "速紫罗兰",
      img: "swift_violet.png",
      got: true,
      meta: ["获取", "Gerudo Highlands"],
      desc: "This vitality-rich flower blooms mainly on cliffsides. When cooked into a dish, the nourishing compounds increase your movement speed.",
      cn_desc: "这种充满生命力的花朵主要开放在悬崖边。烹煮成料理后,其中的滋养成分能提升移动速度。"
    },
    {
      no: "196",
      name: "MIGHTY THISTLE",
      cn: "强壮蓟",
      img: "mighty_thistle.png",
      got: true,
      meta: ["获取", "West Necluda"],
      desc: "This medicinal plant is known for its sharp thorns and for the fruit it bears. The fruit contains a compound that increases attack power when cooked into a dish.",
      cn_desc: "这种药用植物以尖锐的刺和所结的果实而闻名。果实含有一种成分,烹煮成料理后能提升攻击力。"
    },
    {
      no: "197",
      name: "ARMORANTH",
      cn: "装甲花",
      img: "armoranth.png",
      got: true,
      meta: ["获取", "Akkala Highlands"],
      desc: "This tough medicinal plant cannot be broken, but it can be cooked. Its durable yet flexible fibers raise your defense when cooked into a dish.",
      cn_desc: "这种坚韧的药用植物无法被折断,但可以烹煮。它结实而柔韧的纤维烹煮成料理后能提升防御力。"
    },
    {
      no: "198",
      name: "BLUE NIGHTSHADE",
      cn: "蓝色夜光草",
      img: "blue_nightshade.png",
      got: true,
      meta: ["获取", "West Necluda"],
      desc: "A plant that grows in the quieter areas of Hyrule. At night, it gives off a soft glow. Cook with it to increase your stealth.",
      cn_desc: "一种生长在海拉鲁僻静之处的植物。夜间会发出柔和的光。烹煮后能提升隐匿能力。"
    },
    {
      no: "199",
      name: "SILENT PRINCESS",
      cn: "静谧公主",
      img: "silent_princess.png",
      got: true,
      meta: ["获取", "Hyrule Ridge"],
      desc: "This lovely flower was said to have been a favorite of the princess of Hyrule. Once feared to have gone extinct, it's recently been spotted growing in the wild.",
      cn_desc: "据说这种可爱的花朵是海拉鲁公主的最爱。曾一度被认为已经灭绝,最近却有人发现它野生生长。"
    },
    {
      no: "200",
      name: "COURSER BEE HONEY",
      cn: "快蜂蜂蜜",
      img: "courser_bee_honey.png",
      got: true,
      meta: ["获取", "Hyrule Field"],
      desc: "Honey straight from the hive is chock-full of nutrients. Cooking this into a meal unlocks the potential of these nutrients and provides a stamina-recovery effect.",
      cn_desc: "直接从蜂巢取出的蜂蜜营养丰富。将其烹煮成料理,能释放这些营养的潜力,提供回复精力的效果。"
    }
  ],
  equipment: [
    {
      no: "201",
      name: "MASTER SWORD",
      cn: "大师之剑",
      img: "master_sword.png",
      got: true,
      desc: "The legendary sword that seals the darkness. Its blade gleams with a sacred luster that can oppose the Calamity. Only a hero chosen by the sword itself can wield it.",
      cn_desc: "封印黑暗的传说之剑。剑身闪烁着能与灾厄抗衡的神圣光辉。只有被这把剑选中的勇者才能使用它。"
    },
    {
      no: "202",
      name: "TREE BRANCH",
      cn: "树枝",
      img: "tree_branch.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "Wooden branches such as this are pretty common, but it's surprisingly well-balanced. It doesn't do much damage, but can serve as a weapon in a pinch.",
      cn_desc: "像这样的木枝相当常见,但它意外地平衡性好。虽然伤害不高,但紧急情况下可以充当武器。"
    },
    {
      no: "203",
      name: "TORCH",
      cn: "火把",
      img: "torch.png",
      got: true,
      meta: ["来源", "Great Hyrule Forest"],
      desc: "This torch will stay lit once ignited, but if you put it away, the flame will be extinguished until you light it again.",
      cn_desc: "这把火把点燃后会一直保持燃烧,但如果你收起来,火焰就会熄灭,直到你再次点燃它。"
    },
    {
      no: "204",
      name: "SOUP LADLE",
      cn: "汤勺",
      img: "soup_ladle.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "A kitchen implement often used for serving delicious soups. It was carved from the wood of a sturdy tree, so it actually packs quite the wallop.",
      cn_desc: "一种常用于盛汤的厨房用具。它由结实的树木雕刻而成,所以实际上颇具威力。"
    },
    {
      no: "205",
      name: "BOOMERANG",
      cn: "回旋镖",
      img: "boomerang.png",
      got: true,
      meta: ["来源", "West Necluda"],
      desc: "This throwing weapon was originally used by the forest-dwelling Koroks. Its unique shape allows it to return after being thrown.",
      cn_desc: "这种投掷武器最初是居住于森林的克洛格使用的。它独特的形状使它被投出后能飞回手中。"
    },
    {
      no: "206",
      name: "SPRING-LOADED HAMMER",
      cn: "弹簧锤",
      img: "spring-loaded_hammer.png",
      got: true,
      desc: "This strange hammer is one of Kilton's specialties. Being struck by it doesn't hurt much, but the forth swing in a string of attacks will send the victim flying.",
      cn_desc: "这把奇怪的锤子是基尔顿的得意之作。被它击中不太疼,但连击中的第四击会把受害者打飞。"
    },
    {
      no: "207",
      name: "TRAVELER'S SWORD",
      cn: "旅人之剑",
      img: "traveler's_sword.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "A very common sword often kept by travelers to fend off small beasts. It's fairly durable, but a bit unreliable against monsters.",
      cn_desc: "旅人们常携带的普通剑,用来驱赶小型野兽。它相当耐用,但对怪物有点不可靠。"
    },
    {
      no: "208",
      name: "SOLDIER'S BROADSWORD",
      cn: "士兵之剑",
      img: "soldier's_broadsword.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "A sword brandished by the soldiers who once protected Hyrule Castle. Its durable blade is well tuned for slaying monsters.",
      cn_desc: "昔日守护海拉鲁城堡的士兵挥舞的剑。它耐用的刀刃非常适合斩杀怪物。"
    },
    {
      no: "209",
      name: "KNIGHT'S BROADSWORD",
      cn: "骑士之剑",
      img: "knight's_broadsword.png",
      got: true,
      meta: ["来源", "Gerudo Desert"],
      desc: "Knights of Hyrule once carried this sword. These days it's the weapon of choice for seasoned adventurers thanks to its ease of use and high attack power.",
      cn_desc: "海拉鲁的骑士曾佩带这把剑。如今,得益于它的易用性和高攻击力,它成为经验丰富的冒险者们的首选武器。"
    },
    {
      no: "210",
      name: "ROYAL BROADSWORD",
      cn: "王族之剑",
      img: "royal_broadsword.png",
      got: true,
      meta: ["来源", "Tabantha Frontier"],
      desc: "The Hyrulean royal family would award this sword to knights who achieved remarkable feats. A sword that balances strength and beauty as elegantly as this one is a rare find.",
      cn_desc: "海拉鲁王族会把这把剑授予立下卓越功绩的骑士。像这样将力量与美感优雅结合于一身的剑实属罕见。"
    },
    {
      no: "211",
      name: "FOREST DWELLER'S SWORD",
      cn: "森林居民的剑",
      img: "forest_dweller's_sword.png",
      got: true,
      meta: ["来源", "Great Hyrule Forest"],
      desc: "Koroks made this sword for Hylians. It's made of wood, so it isn't the best choice for head-on attacks. Its original intent was likely clearing vines to forge paths through forests.",
      cn_desc: "克洛格为海拉鲁人打造了这把剑。它是木制的,因此不是正面攻击的最佳选择。它最初的作用大概是开辟森林中的道路。"
    },
    {
      no: "212",
      name: "ZORA SWORD",
      cn: "卓拉之剑",
      img: "zora_sword.png",
      got: true,
      meta: ["来源", "Lanayru Great Spring"],
      desc: "The ornamentation that adorns this blade is a traditional Zora design. It's forged from a very durable and rust-proof metal.",
      cn_desc: "装饰在这把剑上的纹饰是卓拉族的传统设计。它由非常耐用且不会生锈的金属锻造而成。"
    },
    {
      no: "213",
      name: "FEATHERED EDGE",
      cn: "羽刃",
      img: "feathered_edge.png",
      got: true,
      meta: ["来源", "Tabantha Frontier"],
      desc: "Rito craftsmen forged this lightweight, double-edged sword so Rito warriors could soar into battle unhindered by its weight.",
      cn_desc: "利特工匠打造了这把轻便的双刃剑,让利特战士能无负重之忧地翱翔作战。"
    },
    {
      no: "214",
      name: "GERUDO SCIMITAR",
      cn: "格鲁德弯刀",
      img: "gerudo_scimitar.png",
      got: true,
      meta: ["来源", "Gerudo Highlands"],
      desc: "This common sword is often carried by Gerudo women for self-defense. Its short, curved blade is easily recognized.",
      cn_desc: "格鲁德女性常携带这种剑防身。它短而弯曲的刀刃很容易辨认。"
    },
    {
      no: "215",
      name: "MOONLIGHT SCIMITAR",
      cn: "月光弯刀",
      img: "moonlight_scimitar.png",
      got: true,
      meta: ["来源", "Gerudo Highlands"],
      desc: "Delicate Gerudo carvings decorate this curved sword. The engraved blade is extremely sharp. Apparently it once served ceremonial purposes in festivals.",
      cn_desc: "这把弯刀上装饰着精致的格鲁德雕刻。镌刻的刀刃极为锋利。据说它曾用于节日中的仪式。"
    },
    {
      no: "216",
      name: "SCIMITAR OF THE SEVEN",
      cn: "七宝匕首",
      img: "scimitar_of_the_seven.png",
      got: true,
      meta: ["来源", "Gerudo Town"],
      desc: "A famous sword once beloved by the Gerudo Champion Urbosa. It is said that when Urbosa swung this sword in battle, her movements resembled a beautiful dance.",
      cn_desc: "格鲁德英杰乌尔波扎曾经钟爱的名剑。据说乌尔波扎挥舞这把剑战斗时,身姿宛如优美的舞蹈。"
    },
    {
      no: "217",
      name: "EIGHTFOLD BLADE",
      cn: "八重之剑",
      img: "eightfold_blade.png",
      got: true,
      meta: ["来源", "West Necluda"],
      desc: "A single-edged sword traditional to the Sheikah tribe. Forged using ancient technology, it's said to be among the sharpest conventional weapons ever made.",
      cn_desc: "希卡族传统的单刃刀。它采用古代技术锻造,据说是迄今最锋利的常规武器之一。"
    },
    {
      no: "218",
      name: "ANCIENT SHORT SWORD",
      cn: "古代短剑",
      img: "ancient_short_sword.png",
      got: true,
      desc: "The blade of this ancient sword was made using an ancient power lost to this modern age. Its blade appears only when drawn, and its cutting power surpasses metal swords.",
      cn_desc: "这把古代短剑的剑刃使用了现代已经失传的古代力量。它的剑刃只在拔出时显现,切割力胜过金属剑。"
    },
    {
      no: "219",
      name: "RUSTY BROADSWORD",
      cn: "锈蚀之剑",
      img: "rusty_broadsword.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "This once-fearsome sword has seen better days. It can do some damage in the right hands but also breaks quickly.",
      cn_desc: "这把昔日令人生畏的剑已风光不再。在合适的人手中它仍能造成伤害,但也很快就会折断。"
    },
    {
      no: "220",
      name: "ROYAL GUARD'S SWORD",
      cn: "近卫之剑",
      img: "royal_guard's_sword.png",
      got: true,
      desc: "A Sheikah-made replica of the sword that seals the darkness. It was made with ancient technology to oppose the Great Calamity, but its low durability made it inefficient.",
      cn_desc: "希卡族仿制封印黑暗之剑的复制品。它采用古代技术制造,以对抗大灾厄,但低下的耐久度使它并不实用。"
    },
    {
      no: "221",
      name: "FLAMEBLADE",
      cn: "火焰剑",
      img: "flameblade.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "This magical sword was forged in the lava of Death Mountain. It leaves white-hot flames in its wake when the blade glows red.",
      cn_desc: "这把魔法剑在死亡之山的岩浆中锻造而成。当剑刃泛红时,剑过之处会留下炽白的火焰。"
    },
    {
      no: "222",
      name: "FROSTBLADE",
      cn: "冰霜剑",
      img: "frostblade.png",
      got: true,
      meta: ["来源", "Gerudo Highlands"],
      desc: "A magical sword forged in the frigid mountains of the Hebra region. When the blade glows blue, enemies struck by it will become frozen.",
      cn_desc: "一把在海布拉地区严寒群山中锻造的魔法剑。当剑刃泛蓝时,被击中的敌人会被冻结。"
    },
    {
      no: "223",
      name: "THUNDERBLADE",
      cn: "雷电剑",
      img: "thunderblade.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "A magical sword forged and refined by lightning from the Hyrule Hills. When the blade shines with a golden light, it will electrocute enemies struck by it.",
      cn_desc: "一把由海拉鲁山丘的雷电锻造淬炼的魔法剑。当剑身闪耀金光时,它会电击被击中的敌人。"
    },
    {
      no: "224",
      name: "BOKO CLUB",
      cn: "波克棒",
      img: "boko_club.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "A crude Bokoblin club made to clobber small prey. It's essentially a stick, so its durability is low.",
      cn_desc: "一把粗糙的波克布林棍棒,用来击打小型猎物。它本质就是根棍子,耐久度很低。"
    },
    {
      no: "225",
      name: "SPIKED BOKO CLUB",
      cn: "钉刺波克棒",
      img: "spiked_boko_club.png",
      got: true,
      meta: ["来源", "Faron Grasslands"],
      desc: "A reinforced Bokoblin club made to maximize damage. The sharpened bones jabbed into make it a brutal weapon.",
      cn_desc: "一种强化过的波克布林棍棒,以最大化伤害为目标。嵌入的磨尖骨头使它成为残忍的武器。"
    },
    {
      no: "226",
      name: "DRAGONBONE BOKO CLUB",
      cn: "龙骨波克棒",
      img: "dragonbone_boko_club.png",
      got: true,
      meta: ["来源", "Hyrule Ridge"],
      desc: "This Bokoblin club has been reinforced with fossilized bones to maximize clobbering potential. Only the brawniest of Bokoblins can manage its immense weight.",
      cn_desc: "这把波克布林棍棒用化石骨头加固,以最大化击打威力。只有最强壮的波克布林才能挥动它沉重的份量。"
    },
    {
      no: "227",
      name: "LIZAL BOOMERANG",
      cn: "蜥蜴回旋镖",
      img: "lizal_boomerang.png",
      got: true,
      meta: ["来源", "Lake Hylia"],
      desc: "A curved sword favored by the Lizalfos. It can be used to attack directly or can be thrown like a boomerang.",
      cn_desc: "蜥蜴战士钟爱的弯刀。它可以直接攻击,也可以像回旋镖一样投掷出去。"
    },
    {
      no: "228",
      name: "LIZAL FORKED BOOMERANG",
      cn: "双叉蜥蜴回旋镖",
      img: "lizal_forked_boomerang.png",
      got: true,
      meta: ["来源", "Gerudo Desert"],
      desc: "Blue Lizalfos in particular like this weapon. It has one more blade than the Lizal boomerang to give it additional cutting power, and it still returns when thrown.",
      cn_desc: "蓝色蜥蜴战士尤其喜欢这种武器。它比蜥蜴回旋镖多一片刀刃,切割力更强,投出后依然能飞回。"
    },
    {
      no: "229",
      name: "LIZAL TRI-BOOMERANG",
      cn: "三叉蜥蜴回旋镖",
      img: "lizal_tri-boomerang.png",
      got: true,
      meta: ["来源", "Hebra Mountains"],
      desc: "More blades mean more attack power! It can be used as a boomerang, but all those blades make that a bit more dangerous. Carried by Black Lizalfos seasoned in battle.",
      cn_desc: "更多刀刃意味着更强攻击力!它可以当作回旋镖使用,但这么多刀刃让这变得有点危险。身经百战的黑色蜥蜴战士会携带它。"
    },
    {
      no: "230",
      name: "GUARDIAN SWORD",
      cn: "守护者之剑",
      img: "guardian_sword.png",
      got: true,
      meta: ["来源", "Eldin Canyon"],
      desc: "A sword often wielded by Guardian Scouts. Its blue energy blade is a product of ancient technology. It's not very durable.",
      cn_desc: "守护者侦察兵常挥舞的剑。它的蓝色能量剑刃是古代技术的产物。耐久度不高。"
    },
    {
      no: "231",
      name: "GUARDIAN SWORD+",
      cn: "守护者之剑+",
      img: "guardian_sword+.png",
      got: true,
      meta: ["来源", "Gerudo Highlands"],
      desc: "This Guardian sword has enhanced power over the standard model. Its cutting capabilities are improved, and its durability has seen a slight uptick.",
      cn_desc: "这把守护者之剑比标准型号威力更强。切割能力得到提升,耐久度也略有增加。"
    },
    {
      no: "232",
      name: "GUARDIAN SWORD++",
      cn: "守护者之剑++",
      img: "guardian_sword++.png",
      got: true,
      meta: ["来源", "Hebra Mountains"],
      desc: "The abilities of this Guardian sword have been boosted to the maximum., as evidenced by its increase in size. It slices through armor like a hot knife through butter!",
      cn_desc: "这把守护者之剑的能力已被强化到极限,从它增大的尺寸便可见一斑。它切割盔甲如同热刀切黄油!"
    },
    {
      no: "233",
      name: "LYNEL SWORD",
      cn: "莱尼尔之剑",
      img: "lynel_sword.png",
      got: true,
      meta: ["来源", "Lanayru Great Spring"],
      desc: "This Lynel-made sword was designed with smashing in mind rather than slicing. It's on the heavy side compared to what Hylians are used to, but it's very strong.",
      cn_desc: "这把莱尼尔打造的剑以砸碎而非切割为设计理念。与海拉鲁人习惯的剑相比偏重,但非常强力。"
    },
    {
      no: "234",
      name: "MIGHTY LYNEL SWORD",
      cn: "强壮莱尼尔之剑",
      img: "mighty_lynel_sword.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "This Lynel-made sword boasts more blades and more attack power. A skilled Lynel can draw this sword simply in passing and still cut a foe in two.",
      cn_desc: "这把莱尼尔之剑拥有更多剑刃和更强攻击力。娴熟的莱尼尔只需顺手一挥,就能将敌人一斩为二。"
    },
    {
      no: "235",
      name: "SAVAGE LYNEL SWORD",
      cn: "凶暴莱尼尔之剑",
      img: "savage_lynel_sword.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "A brutal sword carried by white-haired Lynels. The savage blades are strong enough to cut down any foe, no matter how strong.",
      cn_desc: "白鬃莱尼尔携带的残暴之剑。野蛮的剑刃足以斩倒任何敌人,无论其多么强大。"
    },
    {
      no: "236",
      name: "FIRE ROD",
      cn: "火焰杖",
      img: "fire_rod.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "A magical rod that can cast fireballs, crafted by an ancient magician. The rod will break if it strikes something directly, so use it wisely.",
      cn_desc: "古代魔术师打造、能施放火球的魔法杖。若直接击打物体,杖会折断,请谨慎使用。"
    },
    {
      no: "237",
      name: "METEOR ROD",
      cn: "流星杖",
      img: "meteor_rod.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "A magical rod that can cast three fireballs at once, crafted by an ancient magician. It will break upon running out of magical energy, so make it last!",
      cn_desc: "古代魔术师打造、能同时施放三颗火球的魔法杖。魔力耗尽时杖会折断,请省着用!"
    },
    {
      no: "238",
      name: "ICE ROD",
      cn: "冰霜杖",
      img: "ice_rod.png",
      got: true,
      meta: ["来源", "Gerudo Highlands"],
      desc: "A magical rod crafted from refined ice found in the Hebra Mountains. This rod can cast waves of freezing air. Great for magic - not so great for melee.",
      cn_desc: "用海布拉山出产的纯冰锻造的魔法杖。这根杖能施放冰冻气流。适合魔法,不太适合近战。"
    },
    {
      no: "239",
      name: "BLIZZARD ROD",
      cn: "暴雪杖",
      img: "blizzard_rod.png",
      got: true,
      meta: ["来源", "Gerudo Highlands"],
      desc: "A magical rod that can cast extreme cold in a wide range. These are crafted from refined ice found at the summit of Hebra peak. It will break when depleted.",
      cn_desc: "能在大范围内施放极寒的魔法杖。它由海布拉峰顶出产的纯冰锻造而成。魔力耗尽时会折断。"
    },
    {
      no: "240",
      name: "LIGHTNING ROD",
      cn: "雷电杖",
      img: "lightning_rod.png",
      got: true,
      meta: ["来源", "West Necluda"],
      desc: "A magical rod that can shoot balls of electricity. Its gem contains lightning from the Hyrule Hills. It's not recommended to use as a melee weapon.",
      cn_desc: "能发射电球的魔法杖。它的宝石中含有海拉鲁山丘的雷电。不建议当作近战武器使用。"
    },
    {
      no: "241",
      name: "THUNDERSTORM ROD",
      cn: "雷暴杖",
      img: "thunderstorm_rod.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "A magical rod that can hurl three balls of electricity at once. Its gem contains electricity from the Hyrule Hills, and the rod will break when that electricity runs out.",
      cn_desc: "能同时投掷三颗电球的魔法杖。它的宝石中含有海拉鲁山丘的雷电,雷电耗尽时杖会折断。"
    },
    {
      no: "242",
      name: "VICIOUS SICKLE",
      cn: "恶毒镰刀",
      img: "vicious_sickle.png",
      got: true,
      meta: ["来源", "Gerudo Highlands"],
      desc: "A grim weapon favored by the Yiga. The half-moon shape of the blade allows for the rapid delivery of fatal wounds and serves as a symbol of their terror. Its durability is low.",
      cn_desc: "依盖队钟爱的阴森武器。刀身的半月形状能快速制造致命伤口,也是他们恐怖统治的象征。耐久度较低。"
    },
    {
      no: "243",
      name: "DEMON CARVER",
      cn: "恶魔雕刻刀",
      img: "demon_carver.png",
      got: true,
      desc: "This lethal weapon is forged by the Yiga. Its unique shape facilitates the sound dispatching of any target and strikes fear into the hearts of all who see it.",
      cn_desc: "依盖队锻造的致命武器。它独特的形状便于利落了结任何目标,令所有看到它的人胆寒。"
    },
    {
      no: "244",
      name: "ONE-HIT OBLITERATOR",
      cn: "一击必杀刃",
      img: "one-hit_obliterator.png",
      got: true,
      desc: "A weapon that defeats foes with one hit and causes the user to die within one hit. It loses its sheen and power after two consecutive uses, but it will eventually regain both.",
      cn_desc: "一击就能击败敌人、同时也让你一击毙命的武器。连续使用两次后会失去光泽和威力,但最终会恢复。"
    },
    {
      no: "245",
      name: "BOKOBLIN ARM",
      cn: "波克布林手臂",
      img: "bokoblin_arm.png",
      got: true,
      meta: ["来源", "Greater Hyrule"],
      desc: "A skeletal arm that keeps moving even after it's severed from its body. It's kind of gross to strap it to your back, but it'll do in a pinch. It's old and fragile, so it's quick to break.",
      cn_desc: "一条即使从身体上被砍下仍会蠕动的骷髅手臂。把它绑在背上有点恶心,但紧急时也派得上用场。它又旧又脆,很快就会折断。"
    },
    {
      no: "246",
      name: "LIZALFOS ARM",
      cn: "蜥蜴战士手臂",
      img: "lizalfos_arm.png",
      got: true,
      meta: ["来源", "Greater Hyrule"],
      desc: "The arm of a Stalizalfos that continues to struggle even in death. It can be used as a weapon, but it's very brittle. You can feel it wiggling when you strap it to your back...",
      cn_desc: "骷髅蜥蜴战士的手臂,死后仍在挣扎。它可以当作武器,但非常易碎。把它绑在背上时,你能感觉到它在扭动……"
    },
    {
      no: "247",
      name: "KOROK LEAF",
      cn: "克洛格团扇",
      img: "korok_leaf.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "A single swing of this giant, sturdy leaf can create a gust of wind strong enough to blow away light objects. These will sometimes fall off trees as they're chopped down.",
      cn_desc: "挥动这片巨大而结实的树叶,就能产生足以吹飞轻物的强风。砍树时有时会从树上掉下来。"
    },
    {
      no: "248",
      name: "FARMING HOE",
      cn: "农用锄头",
      img: "farming_hoe.png",
      got: true,
      meta: ["来源", "East Necluda"],
      desc: "A farming tool primarily used for tilling fields. Its fine craftsmanship is sturdy enough to withstand backbreaking fieldwork, but its battle applications are untested.",
      cn_desc: "主要用于翻地的农具。它做工精良,结实到能承受艰苦的田间劳作,但战斗用途未经检验。"
    },
    {
      no: "249",
      name: "BOAT OAR",
      cn: "船桨",
      img: "boat_oar.png",
      got: true,
      meta: ["来源", "East Necluda"],
      desc: "Made for paddling boats, but it was made sturdy enough to fight strong currents. Maybe it's useful for self-defense in a pinch.",
      cn_desc: "本来用于划船,但它被造得足够结实,能对抗湍急的水流。也许紧急情况下能用来防身。"
    },
    {
      no: "250",
      name: "WOODCUTTER'S AXE",
      cn: "樵夫之斧",
      img: "woodcutter's_axe.png",
      got: true,
      meta: ["来源", "West Necluda"],
      desc: "A woodcutter's tool of choice for felling trees. Its formidable weight and uneven balancing make it a slow, inefficient weapon.",
      cn_desc: "樵夫伐树的首选工具。它沉重的重量和不均衡的重心使它成为缓慢、低效的武器。"
    },
    {
      no: "251",
      name: "DOUBLE AXE",
      cn: "双手斧",
      img: "double_axe.png",
      got: true,
      meta: ["来源", "West Necluda"],
      desc: "This double-sided axe was designed with fighting in mind. It's a bit unwieldy, so it requires a well-practiced technique to use efficiently.",
      cn_desc: "这把双面斧为战斗而设计。它有点难以驾驭,需要熟练的技巧才能高效使用。"
    },
    {
      no: "252",
      name: "IRON SLEDGEHAMMER",
      cn: "铁锤",
      img: "iron_sledgehammer.png",
      got: true,
      meta: ["来源", "Eldin Canyon"],
      desc: "This large iron sledgehammer was originally used for mining, but it works reasonably well as a weapon too.",
      cn_desc: "这把大型铁锤原本用于采矿,但当作武器用也相当不错。"
    },
    {
      no: "253",
      name: "GIANT BOOMERANG",
      cn: "巨大回旋镖",
      img: "giant_boomerang.png",
      got: true,
      meta: ["来源", "West Necluda"],
      desc: "This massive boomerang requires two hands. Originally used for hunting, it was modified for use as a weapon. The blades on the inner curves make it a bit trick to wield.",
      cn_desc: "这把巨大的回旋镖需要双手使用。它原本用于狩猎,后来被改装成武器。内弧上的刀刃让它有点难以挥舞。"
    },
    {
      no: "254",
      name: "TRAVELER'S CLAYMORE",
      cn: "旅人双手剑",
      img: "traveler's_claymore.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "A basic two-handed sword often wielded by aspiring adventurers. Its immense weight can knock enemies' shields right out of their hands.",
      cn_desc: "有抱负的冒险者常挥舞的基础双手剑。它沉重的重量能把敌人的盾牌直接震脱手。"
    },
    {
      no: "255",
      name: "SOLDIER'S CLAYMORE",
      cn: "士兵双手剑",
      img: "soldier's_claymore.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "A two-handed sword designed for combat. It's heavy and hard to use but has decent build quality and durability.",
      cn_desc: "为战斗设计的双手剑。它沉重且难以使用,但做工和耐久度都相当不错。"
    },
    {
      no: "256",
      name: "KNIGHT'S CLAYMORE",
      cn: "骑士双手剑",
      img: "knight's_claymore.png",
      got: true,
      meta: ["来源", "Gerudo Desert"],
      desc: "Only the most confident of Hyrule Castle's knights carried this two-handed sword. Its cutting edge is finely honed.",
      cn_desc: "只有海拉鲁城堡中最自信的骑士才会携带这把双手剑。它的刃口打磨得极为精细。"
    },
    {
      no: "257",
      name: "ROYAL CLAYMORE",
      cn: "王族双手剑",
      img: "royal_claymore.png",
      got: true,
      meta: ["来源", "Tabantha Frontier"],
      desc: "A two-handed sword issued to the Hyrulean royal family's immediate guard detail. Its powerful strikes are said to crush an opponent's body and resolve alike.",
      cn_desc: "配发给海拉鲁王族近卫队的双手剑。据说它有力的挥砍能同时粉碎敌人的身体和意志。"
    },
    {
      no: "258",
      name: "SILVER LONGSWORD",
      cn: "白银长刀",
      img: "silver_longsword.png",
      got: true,
      meta: ["来源", "Lanayru Great Spring"],
      desc: "Although the Zora prefer spears to swords, they made this two-handed weapon using a special metal. It found popularity among Hylians for its unique design.",
      cn_desc: "虽然卓拉族偏爱长枪胜过剑,但他们用特殊金属打造了这件双手武器。它独特的设计在海拉鲁人中广受欢迎。"
    },
    {
      no: "259",
      name: "COBBLE CRUSHER",
      cn: "碎石锤",
      img: "cobble_crusher.png",
      got: true,
      meta: ["来源", "Eldin Canyon"],
      desc: "A Goron-made two-handed weapon. It's made from thick, hard metal and has no cutting edge, so it relies on its sheer weight to crush all opponents.",
      cn_desc: "戈隆打造的双手武器。它由厚而硬的金属制成,没有刃口,完全依靠自身的重量碾压所有对手。"
    },
    {
      no: "260",
      name: "STONE SMASHER",
      cn: "巨石锤",
      img: "stone_smasher.png",
      got: true,
      meta: ["来源", "Eldin Canyon"],
      desc: "A two-handed weapon forged from a rare metal mined in Goron City. Its center of gravity is at its tip, so it uses centrifugal force and its sheer weight to smash opponents flat.",
      cn_desc: "用戈隆城开采的稀有金属锻造的双手武器。它的重心位于尖端,利用离心力和自身重量将对手砸扁。"
    },
    {
      no: "261",
      name: "BOULDER BREAKER",
      cn: "碎岩锤",
      img: "boulder_breaker.png",
      got: true,
      meta: ["来源", "Eldin Canyon"],
      desc: "This two-handed weapon was once wielded by the Goron Champion Daruk. Daruk made swinging it around look easy, but a Hylian would need and immense amount of strength.",
      cn_desc: "这把双手武器曾被戈隆英杰达尔克尔使用。达尔克尔挥舞它看起来轻而易举,但海拉鲁人需要极大的力量才能做到。"
    },
    {
      no: "262",
      name: "GOLDEN CLAYMORE",
      cn: "黄金双手剑",
      img: "golden_claymore.png",
      got: true,
      meta: ["来源", "Gerudo Highlands"],
      desc: "Only the most talented Gerudo sword fighters carry this two-handed sword. It's actually much lighter than it appears and is surprisingly easy to wield.",
      cn_desc: "只有最优秀的格鲁德剑士才会携带这把双手剑。它实际上比看起来轻得多,出人意料地易于挥舞。"
    },
    {
      no: "263",
      name: "EIGHTFOLD LONGBLADE",
      cn: "八重长刀",
      img: "eightfold_longblade.png",
      got: true,
      meta: ["来源", "West Necluda"],
      desc: "A single-edged sword seldom seen in Hyrule. This weapon is passed down through the Sheikah tribe and has an astonishingly shape edge ideal for slicing.",
      cn_desc: "海拉鲁难得一见的单刃刀。这把武器在希卡族中代代相传,刀刃锋利得惊人,非常适合切割。"
    },
    {
      no: "264",
      name: "EDGE OF DUALITY",
      cn: "二段之刃",
      img: "edge_of_duality.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "A curious double-edged sword crafted using Sheikah technology. It was originally made for Hyrulean knights unfamiliar with single-edged blades.",
      cn_desc: "一把用希卡技术打造的奇特双刃剑。它原本是为不熟悉单刃剑的海拉鲁骑士制作的。"
    },
    {
      no: "265",
      name: "ANCIENT BLADESAW",
      cn: "古代锯刀",
      img: "ancient_bladesaw.png",
      got: true,
      desc: "This two-handed sword was forged using ancient Sheikah technology. Its unique rotating blades give it impressive cutting power that will slice enemies to shreds.",
      cn_desc: "这把双手剑采用古代希卡技术锻造。它独特的旋转刀刃拥有惊人的切割力,能把敌人切得粉碎。"
    },
    {
      no: "266",
      name: "RUSTY CLAYMORE",
      cn: "锈蚀双手剑",
      img: "rusty_claymore.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "A two-handed sword not properly cared for. Although it can be used as a weapon, its durability is very low. Don't expect it to last for more than a few strikes.",
      cn_desc: "一把没有得到妥善保养的双手剑。虽然可以当作武器,但耐久度极低。别指望它能撑过几次挥击。"
    },
    {
      no: "267",
      name: "ROYAL GUARD'S CLAYMORE",
      cn: "近卫双手剑",
      img: "royal_guard's_claymore.png",
      got: true,
      desc: "The Sheikah used the very essence of ancient technology to forge this greatsword. It was designed to oppose the Calamity, but its low durability made it impractical in battle.",
      cn_desc: "希卡族倾注古代技术的精华锻造了这把巨剑。它被设计用来对抗灾厄,但低下的耐久度使它在战斗中并不实用。"
    },
    {
      no: "268",
      name: "GREAT FLAMEBLADE",
      cn: "大火焰剑",
      img: "great_flameblade.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "This magic-infused greatsword was forged in the fires of Death Mountain by Goron smiths in an ancient age. Attack when the blade glows red to expel flames.",
      cn_desc: "远古时代,戈隆铁匠在死亡之山的火焰中锻造了这把魔法巨剑。当剑刃泛红时攻击,可喷出火焰。"
    },
    {
      no: "269",
      name: "GREAT FROSTBLADE",
      cn: "大冰霜剑",
      img: "great_frostblade.png",
      got: true,
      meta: ["来源", "Hebra Mountains"],
      desc: "This magic infused greatsword was forged by smelting ore found in the Hebra Mountains' permafrost. Attack when the blade glows blue to expel freezing air.",
      cn_desc: "这把魔法巨剑是用海布拉山脉永久冻土中发现的矿石冶炼锻造的。当剑刃泛蓝时攻击,可喷出冰冻气流。"
    },
    {
      no: "270",
      name: "GREAT THUNDERBLADE",
      cn: "大雷电剑",
      img: "great_thunderblade.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "This magic-infused greatsword was forged by the Hyrulean royal family using lightning from the Hyrule Hills. Attack when the blade glows golden to expel lightning.",
      cn_desc: "海拉鲁王族用海拉鲁山丘的雷电锻造了这把魔法巨剑。当剑刃泛金光时攻击,可释放雷电。"
    },
    {
      no: "271",
      name: "BOKO BAT",
      cn: "波克棒槌",
      img: "boko_bat.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "A clunky club made by a Bokoblin. If you swing it at an enemy's shield it may be able to knock the shield out of your foe's hand.",
      cn_desc: "波克布林制作的笨重棍棒。如果朝敌人的盾牌挥击,也许能震飞敌人手中的盾牌。"
    },
    {
      no: "272",
      name: "SPIKED BOKO BAT",
      cn: "钉刺波克棒槌",
      img: "spiked_boko_bat.png",
      got: true,
      meta: ["来源", "Faron Grasslands"],
      desc: "After much consideration by Bokoblins on how to improve the Boko bat, they simply attached sharp spikes to it. A skilled fighter can cause immense damage with this.",
      cn_desc: "波克布林经过深思熟虑,为波克棒槌做了改进,方法很简单:装上锋利的尖刺。技艺高超的战士能用它造成巨大伤害。"
    },
    {
      no: "273",
      name: "DRAGONBONE BOKO BAT",
      cn: "龙骨波克棒槌",
      img: "dragonbone_boko_bat.png",
      got: true,
      meta: ["来源", "Hyrule Ridge"],
      desc: "Used only by the toughest Bokoblin warriors, this Boko bat has been fortified by fossilized bone. It boasts a high durability and is strong enough to beat down powerful foes.",
      cn_desc: "只有最强壮的波克布林战士才会使用,这把波克棒槌用化石骨头加固。它耐久度高,强大到足以击倒强力敌人。"
    },
    {
      no: "274",
      name: "MOBLIN CLUB",
      cn: "莫力棒",
      img: "moblin_club.png",
      got: true,
      meta: ["来源", "Gerudo Highlands"],
      desc: "A crudely fashioned club favored by Moblins. It's carved from a sturdy tree but is sloppily made, so it breaks easily.",
      cn_desc: "莫力布林钟爱的粗制棍棒。它由结实的树木雕刻而成,但做工粗糙,很容易折断。"
    },
    {
      no: "275",
      name: "SPIKED MOBLIN CLUB",
      cn: "钉刺莫力棒",
      img: "spiked_moblin_club.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "Animal bone has been affixed to this Moblin club to greatly improve its damage.",
      cn_desc: "这把莫力布林棍棒上固定了兽骨,大幅提升了伤害。"
    },
    {
      no: "276",
      name: "DRAGONBONE MOBLIN CLUB",
      cn: "龙骨莫力棒",
      img: "dragonbone_moblin_club.png",
      got: true,
      meta: ["来源", "Hebra Mountains"],
      desc: "The bone of an ancient beast has been affixed to this Moblin club, further increasing its damage. Moblins carrying these in battle are particularly dangerous.",
      cn_desc: "这把莫力布林棍棒上固定了远古野兽的骨头,进一步提升了伤害。携带它上阵的莫力布林尤其危险。"
    },
    {
      no: "277",
      name: "ANCIENT BATTLE AXE",
      cn: "古代战斧",
      img: "ancient_battle_axe.png",
      got: true,
      meta: ["来源", "Gerudo Desert"],
      desc: "A weapon used by Guardian Scouts. Its unique blade was forged using ancient technology. Although powerful, its unusual shape causes it to break easily.",
      cn_desc: "守护者侦察兵使用的武器。它独特的刀刃采用古代技术锻造。虽然强大,但奇特的形状使它容易折断。"
    },
    {
      no: "278",
      name: "ANCIENT BATTLE AXE+",
      cn: "古代战斧+",
      img: "ancient_battle_axe+.png",
      got: true,
      meta: ["来源", "Akkala Highlands"],
      desc: "This ancient battle axe's damage output has been increased to maximum. It's sharp enough to cut through almost anything, so it may have been used to forge new routes.",
      cn_desc: "这把古代战斧的伤害输出已提升到最大。它锋利到几乎能切开任何东西,或许曾被用来开辟新道路。"
    },
    {
      no: "279",
      name: "ANCIENT BATTLE AXE++",
      cn: "古代战斧++",
      img: "ancient_battle_axe++.png",
      got: true,
      meta: ["来源", "Hebra Mountains"],
      desc: "This ancient battle axe's damage output is scaled up to peak performance. Ancient technology makes it possible to enhance cutting power beyond metal weapons' limits.",
      cn_desc: "这把古代战斧的伤害输出已提升至巅峰性能。古代技术使其切割力能超越金属武器的极限。"
    },
    {
      no: "280",
      name: "LYNEL CRUSHER",
      cn: "莱尼尔碎击锤",
      img: "lynel_crusher.png",
      got: true,
      meta: ["来源", "Gerudo Highlands"],
      desc: "This Lynel-made two-handed weapon has been reinforced to increase its durability and striking power. Its overwhelming heft will crush your foe, shield and all.",
      cn_desc: "这把莱尼尔打造的双手武器经过加固,提升了耐久度和打击力。它压倒性的重量会把你的敌人连同盾牌一起压碎。"
    },
    {
      no: "281",
      name: "MIGHTY LYNEL CRUSHER",
      cn: "强壮莱尼尔碎击锤",
      img: "mighty_lynel_crusher.png",
      got: true,
      meta: ["来源", "Gerudo Highlands"],
      desc: "This Lynel-made two-handed weapon has been reinforced to increase its durability and striking power. Its overwhelming heft will crush your foe, shield and all.",
      cn_desc: "这把莱尼尔打造的双手武器经过加固,提升了耐久度和打击力。它压倒性的重量会把你的敌人连同盾牌一起压碎。"
    },
    {
      no: "282",
      name: "SAVAGE LYNEL CRUSHER",
      cn: "凶暴莱尼尔碎击锤",
      img: "savage_lynel_crusher.png",
      got: true,
      meta: ["来源", "Hebra Mountains"],
      desc: "This Lynel-made two-handed weapon is immensely heavy thank to a rare metal from Death Mountain's peak. The power of its downward swing is in a class all of its own.",
      cn_desc: "得益于死亡之山顶峰的稀有金属,这把莱尼尔打造的双手武器极其沉重。它向下挥击的威力独一档。"
    },
    {
      no: "283",
      name: "WINDCLEAVER",
      cn: "风斩刀",
      img: "windcleaver.png",
      got: true,
      meta: ["来源", "Gerudo Highlands"],
      desc: "This sword is favored by high-ranking members of the Yiga. When wielded by a proficient fighter, its unique shape cleaves the very wind and creates a vacuum.",
      cn_desc: "依盖队的高层成员钟爱这把刀。在熟练的战士手中,它独特的形状能劈开气流,制造真空。"
    },
    {
      no: "284",
      name: "MOBLIN ARM",
      cn: "莫力布林手臂",
      img: "moblin_arm.png",
      got: true,
      meta: ["来源", "Greater Hyrule"],
      desc: "A Moblin bone that continues to move even after being detached from its body. The bone is thick enough to be used as a weapon but is extremely brittle and easily broken.",
      cn_desc: "一段即使脱离身体仍在蠕动的莫力布林骨头。这根骨头粗到可以当武器,但极其脆弱,容易折断。"
    },
    {
      no: "285",
      name: "WOODEN MOP",
      cn: "木拖把",
      img: "wooden_mop.png",
      got: true,
      meta: ["来源", "East Necluda"],
      desc: "Just a mop to the untrained eye, it excels at tidying up the place. But it owes its sturdy construction to a true craftsman, so it actually has some combat merit.",
      cn_desc: "在外行人眼里它只是拖把,擅长打扫卫生。但它出自真正的工匠之手,结构结实,所以其实也有一定的战斗价值。"
    },
    {
      no: "286",
      name: "FARMER'S PITCHFORK",
      cn: "农用叉",
      img: "farmer's_pitchfork.png",
      got: true,
      meta: ["来源", "East Necluda"],
      desc: "A farming tool used to collect hay efficiently. It's light enough to be used by anyone. The four prongs are very sharp.",
      cn_desc: "一种高效收集干草的农具。它轻到任何人都能使用。四根叉齿非常锋利。"
    },
    {
      no: "287",
      name: "FISHING HARPOON",
      cn: "捕鱼叉",
      img: "fishing_harpoon.png",
      got: true,
      meta: ["来源", "East Necluda"],
      desc: "A fisherman's tool that excels at catching large fish. Its particularly sharp spearhead makes it valuable as a weapon as well.",
      cn_desc: "渔夫的工具,擅长捕捉大鱼。它特别锋利的矛头使它作为武器也很有价值。"
    },
    {
      no: "288",
      name: "THROWING SPEAR",
      cn: "投枪",
      img: "throwing_spear.png",
      got: true,
      meta: ["来源", "West Necluda"],
      desc: "A specialized spear weighted to excel as a throwing weapon. It's perfectly balanced to be thrown harder than your average spear, able to pierce targets from a great distance.",
      cn_desc: "专为投掷而配重的特制长枪。它平衡极佳,比普通长枪投得更远,能从极远距离刺穿目标。"
    },
    {
      no: "289",
      name: "TRAVELER'S SPEAR",
      cn: "旅人之枪",
      img: "traveler's_spear.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "A spear used mainly by travelers to fend off wolves and other beasts. It's easy to hold and simple to use.",
      cn_desc: "旅人主要用来抵御狼等野兽的长枪。它易于握持,使用简单。"
    },
    {
      no: "290",
      name: "SOLDIER'S SPEAR",
      cn: "士兵之枪",
      img: "soldier's_spear.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "A long spear once used by the guards of Hyrule Castle. Easy to use but difficult to master. The iron tip is very sturdy, and the shaft will not burn when exposed to flame.",
      cn_desc: "昔日海拉鲁城堡卫兵使用的长枪。易用但难精。铁制枪头非常结实,枪杆不怕火焰灼烧。"
    },
    {
      no: "291",
      name: "KNIGHT'S HALBERD",
      cn: "骑士长枪",
      img: "knight's_halberd.png",
      got: true,
      meta: ["来源", "Tabantha Frontier"],
      desc: "A spear used by knights adept in mounted combat. The spearhead is modeled after an axe.",
      cn_desc: "擅长骑战的骑士使用的长枪。枪头模仿斧头制成。"
    },
    {
      no: "292",
      name: "ROYAL HALBERD",
      cn: "王族长枪",
      img: "royal_halberd.png",
      got: true,
      meta: ["来源", "Gerudo Highlands"],
      desc: "This spear was issued to the knights who guarded Hyrule Castle's throne room. Its ornate design was applied by a craftsman in service to the royal family.",
      cn_desc: "这把长枪配发给守卫海拉鲁城堡王座厅的骑士。它华丽的装饰出自侍奉王族的工匠之手。"
    },
    {
      no: "293",
      name: "FOREST DWELLER'S SPEAR",
      cn: "森林居民的长枪",
      img: "forest_dweller's_spear.png",
      got: true,
      meta: ["来源", "Great Hyrule Forest"],
      desc: "The Koroks made this spear for Hylians. The shaft is made from a light, sturdy wood, offering ease of use. The spearhead is made from a much harder wood, offering strength.",
      cn_desc: "克洛格为海拉鲁人制作了这把长枪。枪杆由轻而结实的木材制成,易于使用。枪头用更硬的木材制成,保证强度。"
    },
    {
      no: "294",
      name: "ZORA SPEAR",
      cn: "卓拉之枪",
      img: "zora_spear.png",
      got: true,
      meta: ["来源", "Lanayru Great Spring"],
      desc: "This spear is a Zora's weapon of choice. It's lighter than it looks due to being made from a special metal and is used by the Zora for both fishing and protecting their domain.",
      cn_desc: "这把长枪是卓拉族的首选武器。由于采用特殊金属制造,它比看起来轻,卓拉族用它捕鱼和保护领地。"
    },
    {
      no: "295",
      name: "SILVERSCALE SPEAR",
      cn: "银鳞枪",
      img: "silverscale_spear.png",
      got: true,
      meta: ["来源", "Akkala Highlands"],
      desc: "A most skilled Zora fighters wield this spear. Its beautiful fish-tail design belies its impressive strength; the spearhead can piece even the toughest scales.",
      cn_desc: "最娴熟的卓拉战士会挥舞这把长枪。它优美的鱼尾设计掩盖了其惊人的力量;枪头能刺穿最坚硬的鳞片。"
    },
    {
      no: "296",
      name: "CEREMONIAL TRIDENT",
      cn: "仪式枪",
      img: "ceremonial_trident.png",
      got: true,
      meta: ["来源", "Lanayru Great Spring"],
      desc: "A spear modeled after the Lightscale trident wielded by the Zora Champion Mipha. They may be identical in appearance, but this spear's strength and durability are inferior.",
      cn_desc: "以卓拉英杰米法挥舞的光鳞枪为原型仿制的长枪。它们外观可能相同,但这把枪的力量和耐久度都逊色一筹。"
    },
    {
      no: "297",
      name: "LIGHTSCALE TRIDENT",
      cn: "光鳞枪",
      img: "lightscale_trident.png",
      got: true,
      meta: ["来源", "Lanayru Great Spring"],
      desc: "A spear of peerless grace cherished by the Zora Champion Mipha. Although Mipha specialized in healing abilities, her spearmanship was in a class all its own.",
      cn_desc: "卓拉英杰米法珍爱的、优雅无双的长枪。虽然米法专精于治愈能力,但她的枪术同样独树一帜。"
    },
    {
      no: "298",
      name: "DRILLSHAFT",
      cn: "钻头枪",
      img: "drillshaft.png",
      got: true,
      meta: ["来源", "Eldin Canyon"],
      desc: "Goron artisans used recycled metal to forge this weapon. The tip is made from an old excavation bore, which affords it unmatched piercing capabilities.",
      cn_desc: "戈隆工匠用回收金属锻造了这把武器。枪头由旧挖掘钻头制成,赋予它无与伦比的穿刺能力。"
    },
    {
      no: "299",
      name: "FEATHERED SPEAR",
      cn: "羽枪",
      img: "feathered_spear.png",
      got: true,
      meta: ["来源", "Tabantha Frontier"],
      desc: "Its lightweight design is a hallmark of Rito craftsmanship. It's made from light and sturdy materials, which afford Rito warriors ease of use during aerial combat.",
      cn_desc: "轻量设计是利特工艺的标志。它由轻而坚固的材料制成,让利特战士在空战中挥洒自如。"
    },
    {
      no: "300",
      name: "GERUDO SPEAR",
      cn: "格鲁德长枪",
      img: "gerudo_spear.png",
      got: true,
      meta: ["来源", "Gerudo Desert"],
      desc: "This spear's center of gravity is in its tip, making it a bit unwieldy for the average fighter. But in the hands of a skilled Gerudo warrior, it's a weapon of reliable strength.",
      cn_desc: "这把长枪的重心在枪尖,对普通战士来说有点难以操控。但在技艺娴熟的格鲁德战士手中,它是威力可靠的武器。"
    },
    {
      no: "301",
      name: "SERPENTINE SPEAR",
      cn: "蛇形枪",
      img: "serpentine_spear.png",
      got: true,
      meta: ["来源", "East Necluda"],
      desc: "The spearhead of this weapon is uniquely Sheikah in design. Spear masters of the Sheikah tribe can use the crescent shape to snag their opponents and deliver brutal cuts.",
      cn_desc: "这把武器的枪头是独特的希卡式设计。希卡族的长枪大师能用月牙形枪头勾住对手,施以残忍的切割。"
    },
    {
      no: "302",
      name: "ANCIENT SPEAR",
      cn: "古代长枪",
      img: "ancient_spear.png",
      got: true,
      desc: "This spear is the result of countless hours of research into the ancient technology used by Guardians. The glowing spearhead has piercing potential.",
      cn_desc: "这把长枪是对守护者所用古代技术进行无数小时研究后的成果。发光的枪头具有穿刺潜力。"
    },
    {
      no: "303",
      name: "RUSTY HALBERD",
      cn: "锈蚀长枪",
      img: "rusty_halberd.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "A rusty polearm likely used by knights from an age past. The spearhead is in bad shape due to prolonged exposure to the elements, so its durability is low.",
      cn_desc: "一把生锈的长柄武器,可能来自某个久远年代的骑士。枪头因长期暴露在风雨中而状况不佳,耐久度很低。"
    },
    {
      no: "304",
      name: "ROYAL GUARD'S SPEAR",
      cn: "近卫长枪",
      img: "royal_guard's_spear.png",
      got: true,
      desc: "This Sheikah-made spear was created using ancient technology to combat the Calamity. Its attack power is very high, but a critical design flaw left it with poor durability.",
      cn_desc: "这把希卡制作的长枪采用古代技术制造,以对抗灾厄。攻击力极高,但一个致命的设计缺陷使它耐久度低下。"
    },
    {
      no: "305",
      name: "FLAMESPEAR",
      cn: "火焰枪",
      img: "flamespear.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "A magical spear forged in the magma of Death Mountain. Attack when the blade glows to expel powerful flames.",
      cn_desc: "在死亡之山的岩浆中锻造的魔法长枪。当剑刃发光时攻击,可喷出强力火焰。"
    },
    {
      no: "306",
      name: "FROSTSPEAR",
      cn: "冰霜枪",
      img: "frostspear.png",
      got: true,
      meta: ["来源", "Hebra Mountains"],
      desc: "A magical spear forged from ancient ice taken from the Hebra Mountains. Attack when the blade glows blue to chill the air and freeze your foe.",
      cn_desc: "用海布拉山脉采集的古代寒冰锻造的魔法长枪。当剑刃泛蓝时攻击,可冰冻空气、冻结敌人。"
    },
    {
      no: "307",
      name: "THUNDERSPEAR",
      cn: "雷电枪",
      img: "thunderspear.png",
      got: true,
      meta: ["来源", "Hyrule Ridge"],
      desc: "A magical spear that contains thunder from Thundra Plateau in its tip. Attack when the blade glows with a golden light to unleash an electric attack.",
      cn_desc: "枪尖蕴藏雷平原雷电的魔法长枪。当剑刃闪耀金光时攻击,可释放雷电攻击。"
    },
    {
      no: "308",
      name: "BOKO SPEAR",
      cn: "波克枪",
      img: "boko_spear.png",
      got: true,
      meta: ["来源", "West Necluda"],
      desc: "A spear haphazardly carved from a large tree branch. It looks like its original intent was for skewering meat and cooking it, but it does have some combat merit as well.",
      cn_desc: "一把用大树枝随意削成的长枪。看起来它原本是用来串肉烧烤的,但确实也有一定的战斗价值。"
    },
    {
      no: "309",
      name: "SPIKED BOKO SPEAR",
      cn: "钉刺波克枪",
      img: "spiked_boko_spear.png",
      got: true,
      meta: ["来源", "Faron Grasslands"],
      desc: "A Boko spear enhanced with sharpened animal bones. It's light, easy to use, and deals a decent amount of damage.",
      cn_desc: "用磨尖的兽骨强化过的波克枪。它轻便、易用,能造成可观的伤害。"
    },
    {
      no: "310",
      name: "DRAGONBONE BOKO SPEAR",
      cn: "龙骨波克枪",
      img: "dragonbone_boko_spear.png",
      got: true,
      meta: ["来源", "Necluda Sea"],
      desc: "This Boko spear has been strengthened with fossilized bones. The bones are positioned outward so the fangs bite at the opponent. Beware Bokoblins carrying this weapon.",
      cn_desc: "这把波克枪用化石骨头强化过。骨头向外突出,獠牙会撕咬对手。要当心携带这件武器的波克布林。"
    },
    {
      no: "311",
      name: "MOBLIN SPEAR",
      cn: "莫力枪",
      img: "moblin_spear.png",
      got: true,
      meta: ["来源", "Faron Grasslands"],
      desc: "This wooden spear is most often used by Moblins. It's made from a hastily whittled tree, so its stabbing power and durability are both pretty low.",
      cn_desc: "莫力布林最常用的木制长枪。它由匆忙削制的树干做成,刺击力和耐久度都很低。"
    },
    {
      no: "312",
      name: "SPIKED MOBLIN SPEAR",
      cn: "钉刺莫力枪",
      img: "spiked_moblin_spear.png",
      got: true,
      meta: ["来源", "Gerudo Highlands"],
      desc: "This Moblin-made spear uses a horned animal bone as the spearhead. Like many Moblin weapons it's sloppily made, but this one packs some respective piercing power.",
      cn_desc: "这把莫力布林制作的长枪用带角的兽骨作枪头。和许多莫力布林武器一样做工粗糙,但这件拥有相当的穿刺力。"
    },
    {
      no: "313",
      name: "DRAGONBONE MOBLIN SPEAR",
      cn: "龙骨莫力枪",
      img: "dragonbone_moblin_spear.png",
      got: true,
      meta: ["来源", "Hebra Mountains"],
      desc: "This spear is a fan favorite among Moblins. The spearhead is made from fossilized bones adorned with spikes, which greatly increases its stabbing power.",
      cn_desc: "这把长枪是莫力布林们的最爱。枪头由饰有尖刺的化石骨头制成,大幅提升了刺击力。"
    },
    {
      no: "314",
      name: "LIZAL SPEAR",
      cn: "蜥蜴枪",
      img: "lizal_spear.png",
      got: true,
      meta: ["来源", "Lanayru Wetlands"],
      desc: "The brutal, ripping edge of this weapon's spearhead is a distinctly Lizalfos design. Its low durability doesn't lend itself to extended use.",
      cn_desc: "这把武器枪头上残暴的撕裂刃口是典型的蜥蜴战士设计。低耐久度使它不适于长期使用。"
    },
    {
      no: "315",
      name: "ENHANCED LIZAL SPEAR",
      cn: "强化蜥蜴枪",
      img: "enhanced_lizal_spear.png",
      got: true,
      meta: ["来源", "Tabantha Frontier"],
      desc: "Judging by the harpoon-like spearhead of this Lizalfos-made spear, the Lizalfos use it for fishing as well as combat. Try not to get caught on the wrong end of its barbs.",
      cn_desc: "从这把蜥蜴战士长枪鱼叉般的枪头来看,蜥蜴战士既用它捕鱼,也用它作战。小心别被它的倒钩勾住。"
    },
    {
      no: "316",
      name: "FORKED LIZAL SPEAR",
      cn: "双叉蜥蜴枪",
      img: "forked_lizal_spear.png",
      got: true,
      meta: ["来源", "Eldin Canyon"],
      desc: "Skilled Lizalfos warriors tend to favor this spear. What it lacks in piercing power, it makes up for with the brutal wounds its dual ripping blades will inflict.",
      cn_desc: "技艺娴熟的蜥蜴战士战士往往偏爱这把长枪。它在穿刺力上的不足,由双重撕裂刀刃造成的残暴伤口弥补了。"
    },
    {
      no: "317",
      name: "GUARDIAN SPEAR",
      cn: "守护者之枪",
      img: "guardian_spear.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "Wielded by Guardian Scouts, this spear has a high piercing power and is a testament to the Sheikah's high level of technology. The spearhead appears only when brandished.",
      cn_desc: "守护者侦察兵挥舞的这把长枪穿刺力极高,是希卡族高技术水平的有力证明。枪头只在挥舞时显现。"
    },
    {
      no: "318",
      name: "GUARDIAN SPEAR+",
      cn: "守护者之枪+",
      img: "guardian_spear+.png",
      got: true,
      meta: ["来源", "Gerudo Highlands"],
      desc: "The tip of this Guardian spear has been enlarged and strengthened. It's a bit shorter than your average spear, perhaps to facilitate use in tight spaces.",
      cn_desc: "这把守护者之枪的枪尖被加大并强化。它比普通长枪略短,或许是为了方便在狭小空间使用。"
    },
    {
      no: "319",
      name: "GUARDIAN SPEAR++",
      cn: "守护者之枪++",
      img: "guardian_spear++.png",
      got: true,
      meta: ["来源", "Hebra Mountains"],
      desc: "This guardian spear's output has been boosted to the maximum. The spearhead is designed for optimal stabbing, capable of easily piercing most armor.",
      cn_desc: "这把守护者之枪的输出已提升到最大。枪头为最优穿刺而设计,能轻松刺穿大多数盔甲。"
    },
    {
      no: "320",
      name: "LYNEL SPEAR",
      cn: "莱尼尔之枪",
      img: "lynel_spear.png",
      got: true,
      meta: ["来源", "Gerudo Highlands"],
      desc: "The crescent-shaped spearhead of this Lynel-made weapon gives it poor balance, making it difficult to wield. Lynels, however, can swing it effectively with one hand.",
      cn_desc: "这把莱尼尔武器月牙形的枪头使它平衡不佳,难以挥舞。但莱尼尔可以用一只手有效地挥动它。"
    },
    {
      no: "321",
      name: "MIGHTY LYNEL SPEAR",
      cn: "强壮莱尼尔之枪",
      img: "mighty_lynel_spear.png",
      got: true,
      meta: ["来源", "Great Hyrule Forest"],
      desc: "The weight and cutting edge of this Lynel-made spear have both been enhanced. It's immensely heavy for a Hylian, but a Lynel can cleave through rock with a single swing.",
      cn_desc: "这把莱尼尔长枪的重量和刃口都得到了强化。对海拉鲁人来说重得惊人,但莱尼尔一挥就能劈开岩石。"
    },
    {
      no: "322",
      name: "SAVAGE LYNEL SPEAR",
      cn: "凶暴莱尼尔之枪",
      img: "savage_lynel_spear.png",
      got: true,
      meta: ["来源", "Gerudo Highlands"],
      desc: "White-haired Lynels favor this brutal spear. Its axe-like spearhead and exceptional weight give it absolute destructive power.",
      cn_desc: "白鬃莱尼尔钟爱这把残暴的长枪。斧形枪头和超常的重量赋予它绝对的破坏力。"
    },
    {
      no: "323",
      name: "BOW OF LIGHT",
      cn: "光之弓",
      img: "bow_of_light.png",
      got: true,
      desc: "Princess Zelda gave you this bow and arrow for the battle with Dark Beast Ganon. When wielded by the hero, it fires arrows of pure light strong enough to oppose the Calamity.",
      cn_desc: "塞尔达公主在与魔兽盖侬战斗时赠予你的弓和箭。勇者手持时,能射出足以对抗灾厄的纯光之箭。"
    },
    {
      no: "324",
      name: "WOODEN BOW",
      cn: "木弓",
      img: "wooden_bow.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "This wooden bow may not be the most reliable for battling monsters, but is excellent for hunting small animals.",
      cn_desc: "这把木弓对付怪物可能不太可靠,但用来猎杀小动物非常出色。"
    },
    {
      no: "325",
      name: "TRAVELER'S BOW",
      cn: "旅人之弓",
      img: "traveler's_bow.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "A small bow used by travelers for protection. It doesn't do a lot of damage, but it can be used to attack foes from a distance.",
      cn_desc: "旅人用来防身的小弓。伤害不高,但可以从远处攻击敌人。"
    },
    {
      no: "326",
      name: "SOLDIER'S BOW",
      cn: "士兵之弓",
      img: "soldier's_bow.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "A bow designed for armed conflict. Inflicts more damage than a civilian bow, but it will still burn if it touches fire.",
      cn_desc: "为武装冲突设计的弓。伤害高于民用弓,但碰到火仍然会烧毁。"
    },
    {
      no: "327",
      name: "KNIGHT'S BOW",
      cn: "骑士之弓",
      img: "knight's_bow.png",
      got: true,
      meta: ["来源", "Gerudo Desert"],
      desc: "The sturdy metal construction of this bow offers superior durability, while its lack of firing quirks makes it quite reliable. Once favored by the knights at Hyrule Castle.",
      cn_desc: "坚固的金属结构赋予这把弓出色的耐久度,而它没有奇怪的发射习性,非常可靠。曾是海拉鲁城堡骑士的钟爱之物。"
    },
    {
      no: "328",
      name: "ROYAL BOW",
      cn: "王族之弓",
      img: "royal_bow.png",
      got: true,
      meta: ["来源", "Tabantha Frontier"],
      desc: "In the past, the king of Hyrule presented this bow to only the most talented archers in the land. Its combat capabilities are as impressive as its extravagant design.",
      cn_desc: "过去,海拉鲁国王只把这把弓赐给全国最优秀的射手。它的战斗能力与其华丽的设计同样令人印象深刻。"
    },
    {
      no: "329",
      name: "FOREST DWELLER'S BOW",
      cn: "森林居民的弓",
      img: "forest_dweller's_bow.png",
      got: true,
      meta: ["来源", "Tabantha Frontier"],
      desc: "The Koroks made this bow for Hylians. It's crafted from flexible wood and uses sturdy vines for the bowstring. Its construction may be simple, but it fires multiple arrows at once.",
      cn_desc: "克洛格为海拉鲁人制作了这把弓。它用柔韧的木材制成,弓弦采用结实的藤蔓。构造虽然简单,却能一次射出多支箭。"
    },
    {
      no: "330",
      name: "SILVER BOW",
      cn: "白银弓",
      img: "silver_bow.png",
      got: true,
      meta: ["来源", "Lanayru Great Spring"],
      desc: "A bow favored by the Zora for fishing. It doesn't boast the highest firepower, but the special metal it's crafted from prioritizes durability.",
      cn_desc: "卓拉族捕鱼时钟爱的弓。它的火力并非最强,但所用的特殊金属优先保证了耐久度。"
    },
    {
      no: "331",
      name: "SWALLOW BOW",
      cn: "燕之弓",
      img: "swallow_bow.png",
      got: true,
      meta: ["来源", "Tabantha Frontier"],
      desc: "This bow is a favorite among Rito warriors. The bowstring has been specially engineered for aerial combat, which allows it to be drawn faster than a normal bow.",
      cn_desc: "利特战士最爱的弓。弓弦经过特殊设计,适合空战,拉弓速度比普通弓更快。"
    },
    {
      no: "332",
      name: "FALCON BOW",
      cn: "隼之弓",
      img: "falcon_bow.png",
      got: true,
      meta: ["来源", "Tabantha Frontier"],
      desc: "A highly refined Rito-made bow created by a master Rito craftsman. Rito warriors favor it for its superior rate of fire, which helps them excel even further at aerial combat.",
      cn_desc: "利特大师工匠打造的高精度弓。利特战士偏爱它卓越的射速,这让他们在空战中更加出色。"
    },
    {
      no: "333",
      name: "GREAT EAGLE BOW",
      cn: "大鹫弓",
      img: "great_eagle_bow.png",
      got: true,
      meta: ["来源", "Tabantha Frontier"],
      desc: "A bow without equal wielded by the Rito Champion, Revali. It's said that Revali could loose arrows with the speed of a gale, making him supreme in aerial combat.",
      cn_desc: "利特英杰力巴尔使用的无与伦比的弓。据说力巴尔能像疾风般射箭,在空中战中所向披靡。"
    },
    {
      no: "334",
      name: "GOLDEN BOW",
      cn: "黄金弓",
      img: "golden_bow.png",
      got: true,
      meta: ["来源", "Gerudo Highlands"],
      desc: "This Gerudo-made bow is popular for the fine ornamentations along its limbs. Designed for hunting and warfare alike, this bow was engineered to strike distant targets.",
      cn_desc: "这把格鲁德制造的弓以弓臂上精美的饰纹而受欢迎。它为狩猎和战争双重设计,专为打击远距离目标而造。"
    },
    {
      no: "335",
      name: "PHRENIC BOW",
      cn: "神秘弓",
      img: "phrenic_bow.png",
      got: true,
      meta: ["来源", "West Necluda"],
      desc: "A bow passed down through the Sheikah tribe. Concentrating before drawing the string will allow you to target distant enemies as easily as those nearby.",
      cn_desc: "希卡族代代相传的弓。拉弓前凝神聚气,就能像瞄准近处敌人一样轻松瞄准远处的敌人。"
    },
    {
      no: "336",
      name: "ANCIENT BOW",
      cn: "古代弓",
      img: "ancient_bow.png",
      got: true,
      desc: "This bow is the result of Robbie's research. Ancient Sheikah technology affords it heightened functionality. Arrows fired from it travel in a perfectly straight line.",
      cn_desc: "这把弓是洛贝利研究的成果。古代希卡技术赋予它更高的功能。从它射出的箭沿完美的直线飞行。"
    },
    {
      no: "337",
      name: "ROYAL GUARD'S BOW",
      cn: "近卫之弓",
      img: "royal_guard's_bow.png",
      got: true,
      desc: "This prototype Sheikah-made bow was designed to fight the Great Calamity. Made with ancient technology, it boast a high rate of fire and firepower, but has a low durability.",
      cn_desc: "这把希卡原型弓被设计用于对抗大灾厄。它采用古代技术制造,拥有高射速和高火力,但耐久度低。"
    },
    {
      no: "338",
      name: "BOKO BOW",
      cn: "波克弓",
      img: "boko_bow.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "A basic Bokoblin bow made from wood. It's made by taking any tree branch and just tying a string to either end, so don't expect much in the way of combat effectiveness.",
      cn_desc: "波克布林用木材制作的基础弓。它的制作方法是随便找根树枝,两端系上弦,所以别指望有什么战斗效果。"
    },
    {
      no: "339",
      name: "SPIKED BOKO BOW",
      cn: "钉刺波克弓",
      img: "spiked_boko_bow.png",
      got: true,
      meta: ["来源", "Faron Grasslands"],
      desc: "An upgraded Boko bow bound with animal bone to boost its durability and firepower. Its craftsmanship is sloppy, but it's light and easy to use.",
      cn_desc: "一把强化过的波克弓,用兽骨捆扎以提升耐久度和火力。做工粗糙,但轻便易用。"
    },
    {
      no: "340",
      name: "DRAGON BONE BOKO BOW",
      cn: "龙骨波克弓",
      img: "dragon_bone_boko_bow.png",
      got: true,
      meta: ["来源", "Hyrule Ridge"],
      desc: "A Boko bow reinforced by fossils. Bokoblins handpicked the materials it's made from, so it boasts a respectable firepower.",
      cn_desc: "用化石强化的波克弓。波克布林精心挑选了制作材料,因此拥有相当不错的火力。"
    },
    {
      no: "341",
      name: "LIZAL BOW",
      cn: "蜥蜴弓",
      img: "lizal_bow.png",
      got: true,
      meta: ["来源", "Lanayru Great Spring"],
      desc: "A wooden bow created by Lizalfos. It's reinforced by the bones of a large fish - a marked improvement over any standard wooden bow.",
      cn_desc: "蜥蜴战士制作的木弓。它用大鱼骨加固,比任何标准木弓都有明显进步。"
    },
    {
      no: "342",
      name: "STRENGTHENED LIZAL BOW",
      cn: "强化蜥蜴弓",
      img: "strengthened_lizal_bow.png",
      got: true,
      meta: ["来源", "Tabantha Frontier"],
      desc: "A Lizal bow with a grip reinforced by metal. The body is made from the branches of a flexible tree that grows near water, which offers some serious destructive power.",
      cn_desc: "一把握把用金属强化的蜥蜴弓。弓身采用水边生长的柔韧树枝制成,具有相当可观的破坏力。"
    },
    {
      no: "343",
      name: "STEEL LIZAL BOW",
      cn: "钢铁蜥蜴弓",
      img: "steel_lizal_bow.png",
      got: true,
      meta: ["来源", "Hebra Mountains"],
      desc: "This bow is wielded by Lizalfos who are expert marksmen. The metal that reinforces much of the weapon adds some additional weight but offers heightened durability.",
      cn_desc: "神射手蜥蜴战士挥舞的弓。大量用于加固的金属增加了些重量,但提升了耐久度。"
    },
    {
      no: "344",
      name: "LYNEL BOW",
      cn: "莱尼尔之弓",
      img: "lynel_bow.png",
      got: true,
      meta: ["来源", "Gerudo Highlands"],
      desc: "A Lynel-made bow crafted from rough metal. True to the vicious nature of Lynel weaponry, it fires a spread of multiple arrows at once. Ideal for taking down quick-moving targets.",
      cn_desc: "莱尼尔用粗金属打造的弓。一如莱尼尔武器的凶残本性,它一次能射出多支箭。非常适合对付快速移动的目标。"
    },
    {
      no: "345",
      name: "MIGHTY LYNEL BOW",
      cn: "强壮莱尼尔之弓",
      img: "mighty_lynel_bow.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "This massive Lynel bow sports a bowstring made from a metal so tough, mere Hylians have trouble drawing it back.",
      cn_desc: "这把巨大的莱尼尔弓的弓弦由极硬的金属制成,普通海拉鲁人连拉开都很困难。"
    },
    {
      no: "346",
      name: "SAVAGE LYNEL BOW",
      cn: "凶暴莱尼尔之弓",
      img: "savage_lynel_bow.png",
      got: true,
      meta: ["来源", "Hebra Mountains"],
      desc: "This Lynel bow is made from a special steel found at the peak of Death Mountain. It has tremendous stopping power and can pierce think armor as easily as thin paper.",
      cn_desc: "这把莱尼尔弓用死亡之山顶峰发现的特殊钢材制成。它拥有巨大的制动力,穿透厚重盔甲如同穿透薄纸。"
    },
    {
      no: "347",
      name: "DUPLEX BOW",
      cn: "双联弓",
      img: "duplex_bow.png",
      got: true,
      meta: ["来源", "Gerudo Highlands"],
      desc: "A bow favored by the skilled archers of the Yiga Clan. It's been engineered to fire two arrows at once to ensure your target comes to a swift a none-two-pleasant halt.",
      cn_desc: "依盖队神射手钟爱的弓。它经过专门设计,一次射出两支箭,确保你的目标迅速而痛苦地倒下。"
    },
    {
      no: "348",
      name: "ARROW",
      cn: "箭",
      img: "arrow.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "A common arrow. Its shaft was carved from the wood of a sturdy tree.",
      cn_desc: "一支普通的箭。箭杆由结实的树木木材削制而成。"
    },
    {
      no: "349",
      name: "FIRE ARROW",
      cn: "火箭",
      img: "fire_arrow.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "An arrow imbued with the power of fire. It breaks apart on impact, igniting objects in the immediate area. It's incredibly effective against cold things.",
      cn_desc: "一支蕴含火之力量的箭。命中时碎裂,点燃周围物体。对付冰冷之物效果极佳。"
    },
    {
      no: "350",
      name: "ICE ARROW",
      cn: "冰箭",
      img: "ice_arrow.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "An arrow imbued with the power of ice. It breaks apart on impact, freezing objects in the immediate area. It's incredibly effective against hot things.",
      cn_desc: "一支蕴含冰之力量的箭。命中时碎裂,冻结周围物体。对付炎热之物效果极佳。"
    },
    {
      no: "351",
      name: "SHOCK ARROW",
      cn: "电箭",
      img: "shock_arrow.png",
      got: true,
      meta: ["来源", "Lanayru Great Spring"],
      desc: "An arrow imbued with the power of electricity. It breaks apart on impact, channeling electricity into nearby objects. It's incredibly effective against metal or anything wet.",
      cn_desc: "一支蕴含雷电之力的箭。命中时碎裂,将电流导入附近物体。对付金属或任何潮湿之物效果极佳。"
    },
    {
      no: "352",
      name: "BOMB ARROW",
      cn: "炸弹箭",
      img: "bomb_arrow.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "A powerful arrow designed to destroy monsters. The explosive powder packed into the tip ignites on impact, dealing massive damage to anything caught in the blast.",
      cn_desc: "专为毁灭怪物设计的强力箭。尖端填充的炸药粉末在命中时点燃,对爆炸范围内的目标造成巨大伤害。"
    },
    {
      no: "353",
      name: "ANCIENT ARROW",
      cn: "古代箭",
      img: "ancient_arrow.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "An arrow created using ancient technology. To be struck with one is to be consigned to oblivion in an instant. It deals devastating damage—even against Guardians.",
      cn_desc: "用古代技术制造的箭。被它击中意味着瞬间归于虚无。它造成毁灭性的伤害——即使是守护者也不例外。"
    },
    {
      no: "354",
      name: "HYLIAN SHIELD",
      cn: "海利亚盾",
      img: "hylian_shield.png",
      got: true,
      desc: "A shield passes down through the Hylian royal family, along with the legend of the hero who wielded it. Its defensive capabilities and durability outshine all other shields.",
      cn_desc: "海利亚王族世代相传的盾牌,连同那位勇者的传说。它的防御能力和耐久度超越所有其他盾牌。"
    },
    {
      no: "355",
      name: "POT LID",
      cn: "锅盖",
      img: "pot_lid.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "The lid of a large soup pot. It smells vaguely of poultry broth... Yum! It can take quite a beating before breaking.",
      cn_desc: "大汤锅的锅盖。闻起来隐约有鸡汤味……好香!它能承受相当多次的打击才破裂。"
    },
    {
      no: "356",
      name: "WOODEN SHIELD",
      cn: "木盾",
      img: "wooden_shield.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "This lightweight, simple shield is ideal for less-experienced fighters. It can withstand light attacks, but blocking stronger blows is not recommended.",
      cn_desc: "这种轻便简单的盾牌非常适合经验不足的战士。它能抵御轻微攻击,但不建议用来格挡强力打击。"
    },
    {
      no: "357",
      name: "EMBLAZONED SHIELD",
      cn: "纹章盾",
      img: "emblazoned_shield.png",
      got: true,
      meta: ["来源", "East Necluda"],
      desc: "This shield features a traditional design from Necluda. Its combat capabilities aren't much better than the standard wooden shield, but it found popularity for its design.",
      cn_desc: "这面盾牌带有内克拉达的传统图案。战斗能力并不比普通木盾好多少,但因设计而广受欢迎。"
    },
    {
      no: "358",
      name: "HUNTER'S SHIELD",
      cn: "猎人盾",
      img: "hunter's_shield.png",
      got: true,
      meta: ["来源", "Hebra Mountains"],
      desc: "Favored by hunters for its rabbit design, which is said to bring luck on hunts. It's easy to use, but its durability leaves something to be desired.",
      cn_desc: "猎人钟爱的盾牌,上面的兔子图案据说能带来狩猎好运。它易于使用,但耐久度差强人意。"
    },
    {
      no: "359",
      name: "FISHERMAN'S SHIELD",
      cn: "渔夫盾",
      img: "fisherman's_shield.png",
      got: true,
      meta: ["来源", "East Necluda"],
      desc: "Often carried by fishermen for its fish design, which represents hope for a good catch. Its light wooden construction makes it convenient to take on a boat.",
      cn_desc: "渔夫常携带的盾牌,鱼形图案代表着对丰收渔获的希望。轻巧的木制结构使它便于带上船。"
    },
    {
      no: "360",
      name: "TRAVELER'S SHIELD",
      cn: "旅人盾",
      img: "traveler's_shield.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "A sturdy shield loved by many an adventurer. It is made of animal hide and sturdy wood and is best suited to defending against weak monsters or animals.",
      cn_desc: "许多冒险者喜爱的坚固盾牌。它由兽皮和结实的木材制成,最适合抵御弱小的怪物或野兽。"
    },
    {
      no: "361",
      name: "SOLDIER'S SHIELD",
      cn: "士兵盾",
      img: "soldier's_shield.png",
      got: true,
      meta: ["来源", "Tabantha Frontier"],
      desc: "A shield once used by the guards of Hyrule Castle. It's easy to handle, but its core is made of wood, so it can catch fire.",
      cn_desc: "昔日海拉鲁城堡卫兵使用的盾牌。易于操控,但核心是木制的,可能会着火。"
    },
    {
      no: "362",
      name: "KNIGHT'S SHIELD",
      cn: "骑士盾",
      img: "knight's_shield.png",
      got: true,
      meta: ["来源", "Hebra Mountains"],
      desc: "A shield favored by the knights who served the Hyrulean royal family. Its sturdy metal construction makes it quite durable, but its weight requires decent skill to wield.",
      cn_desc: "侍奉海拉鲁王族的骑士钟爱的盾牌。坚固的金属结构使它相当耐用,但重量需要相当的技巧才能挥舞。"
    },
    {
      no: "363",
      name: "ROYAL SHIELD",
      cn: "王族盾",
      img: "royal_shield.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "A shield issued to the Hyrulean royal family's immediate guard detail. It boasts a high defense, but these days it's more a collector's item due to its ornamentation.",
      cn_desc: "配发给海拉鲁王族近卫队的盾牌。防御力很高,但如今由于华丽的装饰,它更像是收藏品。"
    },
    {
      no: "364",
      name: "FOREST DWELLER'S SHIELD",
      cn: "森林居民的盾",
      img: "forest_dweller's_shield.png",
      got: true,
      meta: ["来源", "Great Hyrule Forest"],
      desc: "The Koroks made this shield specifically for Hylians. It's made from the finest hard wood of trees that only grow in the Korok forest, so it's sturdier than it looks.",
      cn_desc: "克洛格专门为海拉鲁人制作了这面盾牌。它由克洛格森林特产的优质硬木制成,比看起来结实得多。"
    },
    {
      no: "365",
      name: "SILVER SHIELD",
      cn: "白银盾",
      img: "silver_shield.png",
      got: true,
      meta: ["来源", "Lanayru Great Spring"],
      desc: "A Zora-made shield adorned with intricate ornamentation. It's said that true masters of this shield can redirect attacks as a rock redirects rushing water.",
      cn_desc: "饰有精巧花纹的卓拉盾牌。据说真正掌握此盾的大师,能像岩石分流湍急水流一样卸开攻击。"
    },
    {
      no: "366",
      name: "KITE SHIELD",
      cn: "风筝盾",
      img: "kite_shield.png",
      got: true,
      meta: ["来源", "Hebra Mountains"],
      desc: "Rito warriors cherish this shield. Its unique shape is designed with mid-battle flight in mind to facilitate aerial combat.",
      cn_desc: "利特战士珍视这面盾牌。它独特的形状专为战斗中的飞行设计,便于进行空战。"
    },
    {
      no: "367",
      name: "GERUDO SHIELD",
      cn: "格鲁德盾",
      img: "gerudo_shield.png",
      got: true,
      meta: ["来源", "Gerudo Desert"],
      desc: "The design of this metal shield has changed over time to match the Gerudo's sword-and-shield fighting style. It's favored by soldiers and travelers alike.",
      cn_desc: "这面金属盾牌的设计随时代演变,以配合格鲁德人的剑盾战法。士兵和旅人都很喜爱它。"
    },
    {
      no: "368",
      name: "RADIANT SHIELD",
      cn: "光辉盾",
      img: "radiant_shield.png",
      got: true,
      meta: ["来源", "Gerudo Desert"],
      desc: "This extravagant shield is presented to Gerudo warriors who rise to the rank of captain. Its apparent opulence is rivaled only by its combat capabilities.",
      cn_desc: "这面华丽的盾牌被授予晋升为队长的格鲁德战士。它外表的奢华,唯有战斗能力可与之媲美。"
    },
    {
      no: "369",
      name: "DAYBREAKER",
      cn: "破晓之盾",
      img: "daybreaker.png",
      got: true,
      meta: ["来源", "Gerudo Desert"],
      desc: "This shield was cherished by the Gerudo Champion Urbosa. The gold used to make it was handpicked to ensure a design that is both lightweight and very durable.",
      cn_desc: "格鲁德英杰乌尔波扎珍爱的盾牌。制作所用的黄金经过精心挑选,以确保设计既轻巧又非常耐用。"
    },
    {
      no: "370",
      name: "SHIELD OF THE MIND'S EYE",
      cn: "心眼之盾",
      img: "shield_of_the_mind's_eye.png",
      got: true,
      meta: ["来源", "West Necluda"],
      desc: "A small Sheikah-made shield. Its design is intended to decrease blind spots without sacrificing too much defense.",
      cn_desc: "希卡族制作的小型盾牌。它的设计旨在减少视野盲区,同时不过多牺牲防御。"
    },
    {
      no: "371",
      name: "ANCIENT SHIELD",
      cn: "古代盾",
      img: "ancient_shield.png",
      got: true,
      desc: "This shield was made using ancient Sheikah technology. Its surface glows blue when raised in defense. Enhanced functionality allows it to deflect Guardian beams.",
      cn_desc: "用古代希卡技术制造的盾牌。举盾防御时表面会发出蓝光。强化功能使它能够反弹守护者的光束。"
    },
    {
      no: "372",
      name: "RUSTY SHIELD",
      cn: "锈蚀盾",
      img: "rusty_shield.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "It's likely that this rusty old shield once belonged to a knight. It still has some defensive capabilities, but its usefulness has been worn down by time.",
      cn_desc: "这面生锈的旧盾很可能曾属于某位骑士。它仍有一些防御能力,但实用性已被岁月消磨殆尽。"
    },
    {
      no: "373",
      name: "ROYAL GUARD'S SHIELD",
      cn: "近卫盾",
      img: "royal_guard's_shield.png",
      got: true,
      desc: "This shield was forged using ancient Sheikah technology. It boasts extremely high stopping power, but its structural weakness made its low durability impractical for combat.",
      cn_desc: "这面盾牌采用古代希卡技术锻造。它拥有极高的制动力,但结构上的弱点使它低下的耐久度不适用于实战。"
    },
    {
      no: "374",
      name: "BOKO SHIELD",
      cn: "波克盾",
      img: "boko_shield.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "A Bokoblin-made shield created by attaching a handhold to any flat tree bark picked up off the ground. It's pretty shoddy, so don't expect it to last very long.",
      cn_desc: "波克布林做的盾牌,做法是把一块捡来的扁平树皮装上把手。它相当粗糙,别指望它能撑很久。"
    },
    {
      no: "375",
      name: "SPIKED BOKO SHIELD",
      cn: "钉刺波克盾",
      img: "spiked_boko_shield.png",
      got: true,
      meta: ["来源", "Faron Grasslands"],
      desc: "A Boko shield made of slightly stronger wood and reinforced with animal bones.",
      cn_desc: "用稍硬的木材制成、并以兽骨强化的波克盾。"
    },
    {
      no: "376",
      name: "DRAGONBONE BOKO SHIELD",
      cn: "龙骨波克盾",
      img: "dragonbone_boko_shield.png",
      got: true,
      meta: ["来源", "Hyrule Ridge"],
      desc: "This Boko shield is reinforced with fossilized bone. Its defensive capabilities are respectable, but its predictably slipshod craftsmanship spells low durability.",
      cn_desc: "这面波克盾用化石骨头强化。防御能力尚可,但意料之中的粗糙做工意味着耐久度低下。"
    },
    {
      no: "377",
      name: "LIZAL SHIELD",
      cn: "蜥蜴盾",
      img: "lizal_shield.png",
      got: true,
      meta: ["来源", "Lake Hylia"],
      desc: "A common shield found among the Lizalfos. It's made of metal, but its sloppy craftsmanship offers poor durability.",
      cn_desc: "蜥蜴战士中常见的盾牌。虽然是金属制的,但粗糙的做工使耐久度不佳。"
    },
    {
      no: "378",
      name: "REINFORCED LIZAL SHIELD",
      cn: "强化蜥蜴盾",
      img: "reinforced_lizal_shield.png",
      got: true,
      meta: ["来源", "Tabantha Frontier"],
      desc: "This Lizal shield has been strengthened by adding a different type of metal to the mix. The edge is lined with spikes, so handle with care.",
      cn_desc: "这面蜥蜴盾通过混入另一种金属得到强化。边缘布满尖刺,请小心拿取。"
    },
    {
      no: "379",
      name: "STEEL LIZAL SHIELD",
      cn: "钢铁蜥蜴盾",
      img: "steel_lizal_shield.png",
      got: true,
      meta: ["来源", "Hebra Mountains"],
      desc: "This Lizal shield is adorned with several metal shells as a means of reinforcement. Its defensive capabilities are high, but its weight requires a skilled soldier to bear.",
      cn_desc: "这面蜥蜴盾饰有多片金属壳作为强化。防御力很高,但重量需要熟练的战士才能承受。"
    },
    {
      no: "380",
      name: "GUARDIAN SHIELD",
      cn: "守护者之盾",
      img: "guardian_shield.png",
      got: true,
      meta: ["来源", "West Necluda"],
      desc: "A shield made with ancient Sheikah technology. It can deflect a Guardian Scout's beam.",
      cn_desc: "用古代希卡技术制造的盾牌。它能反弹守护者侦察兵的光束。"
    },
    {
      no: "381",
      name: "GUARDIAN SHIELD+",
      cn: "守护者之盾+",
      img: "guardian_shield+.png",
      got: true,
      meta: ["来源", "East Necluda"],
      desc: "This larger version of a Guardian shield has had its output level boosted. Its defensive capabilities are comparable to those of a metal shield's.",
      cn_desc: "这种加大版的守护者盾牌,输出等级已被提升。防御能力可与金属盾牌媲美。"
    },
    {
      no: "382",
      name: "GUARDIAN SHIELD++",
      cn: "守护者之盾++",
      img: "guardian_shield++.png",
      got: true,
      meta: ["来源", "Gerudo Highlands"],
      desc: "The output level of this shield has been boosted to a maximum. Its combat capabilities surpass those of metallic shields, and it can deflect Guardian Scout beams.",
      cn_desc: "这面盾牌的输出等级已提升到最大。战斗能力超越金属盾牌,并能反弹守护者侦察兵的光束。"
    },
    {
      no: "383",
      name: "LYNEL SHIELD",
      cn: "莱尼尔之盾",
      img: "lynel_shield.png",
      got: true,
      meta: ["来源", "Lanayru Great Spring"],
      desc: "A sturdy shield favored by Lynels for its defensive and offensive capabilities. First and foremost a shield, but the bladed edges can deal slashing attacks when deflecting.",
      cn_desc: "莱尼尔钟爱的坚固盾牌,攻防俱佳。它首先是一面盾,但格挡时带刃的边缘能造成斩击伤害。"
    },
    {
      no: "384",
      name: "MIGHTY LYNEL SHIELD",
      cn: "强壮莱尼尔之盾",
      img: "mighty_lynel_shield.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "This Lynel-made shield has been reinforced with armor and even more blades. Stronger in both defense and offense, it can tear through basic armor when deflecting.",
      cn_desc: "这面莱尼尔盾牌用盔甲和更多刀刃强化过。攻防都更强,格挡时能撕裂普通盔甲。"
    },
    {
      no: "385",
      name: "SAVAGE LYNEL SHIELD",
      cn: "凶暴莱尼尔之盾",
      img: "savage_lynel_shield.png",
      got: true,
      meta: ["来源", "Hyrule Field"],
      desc: "This ultimate Lynel shield is used only by the white-haired Lynels. It excels at defending against even the most brutal of attacks and cutting down powerful foes when deflecting.",
      cn_desc: "只有白鬃莱尼尔才会使用的终极莱尼尔盾。它擅长防御最残暴的攻击,格挡时还能砍倒强敌。"
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
      desc: "Fortunes untold (potentially) await the lucky adventurer who finds one of these. Chests can often be found within shrines or at enemy camps, but there may be some crafty folks who think they're safer underground.",
      cn_desc: "找到这种宝箱的幸运冒险者,可能会收获难以估量的财富。宝箱常见于神庙之中,里面存放着各种珍贵物品。"
    },
    {
      no: "387",
      name: "ORE DEPOSIT",
      cn: "矿脉",
      img: "ore_deposit.png",
      got: true,
      meta: ["发现", "Greater Hyrule"],
      desc: "This deposit contains a good deal of ore. Breaking the rock will yield rock salt, flint, and other minerals of varying value.",
      cn_desc: "这种矿脉含有大量矿石。敲碎岩石可以获得岩盐、燧石以及各种数量的其他矿物。"
    },
    {
      no: "388",
      name: "RARE ORE DEPOSIT",
      cn: "稀有矿脉",
      img: "rare_ore_deposit.png",
      got: true,
      meta: ["发现", "Greater Hyrule"],
      desc: "This deposit contains a good deal of precious ore and the occasional rare mineral, like ruby and sapphire. Break it open to see what it has to offer!",
      cn_desc: "这种矿脉含有大量珍贵矿石,偶尔还有红宝石、蓝宝石等稀有矿物。敲开它即可获取。"
    },
    {
      no: "389",
      name: "LUMINOUS ORE DEPOSIT",
      cn: "夜光矿脉",
      img: "luminous_ore_deposit.png",
      got: true,
      meta: ["发现", "Greater Hyrule"],
      desc: "This deposit contains quite a bit of luminous stone. Crack it open to get at the easily process rocks within.",
      cn_desc: "这种矿脉含有相当多的夜光石。敲开它,就能获得内部易于加工的岩石。"
    }
  ],
};