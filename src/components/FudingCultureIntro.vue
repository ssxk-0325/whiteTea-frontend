<template>
  <div id="fuding-culture-intro" class="fuding-culture-intro">
    <!-- 全屏背景：图片占满区域，文字区滚动叠加在上层 -->
    <div class="fuding-bg" aria-hidden="true">
      <img
        v-for="(src, idx) in backgroundImages"
        :key="`${idx}-${src}`"
        :src="src"
        class="fuding-bg-img"
        :class="{ active: idx === activeBgIndex }"
        alt=""
        @error="onBgImageError"
      />
      <div class="fuding-bg-overlay" />
    </div>

    <el-container class="fuding-content-wrap">
      <el-main class="fuding-main">
        <article class="article">
          <header class="hero-content" aria-label="福鼎白茶文化 · 地域与人文">
            <div class="hero-kicker">边界明珠 · 中国茶文化之乡</div>
            <h1 class="hero-title">山海之间的茶韵千年</h1>
            <p class="hero-subtitle">
              在福建东北部的山海交汇处，福鼎如一颗温润的明珠，镶嵌在闽浙边界。这座被誉为 “边界明珠，海滨邹鲁”
              的县级市，既是闽越与瓯越文化的发源地，也是 “中国茶文化之乡”。山的灵秀与海的辽阔在此交融，孕育出独特的地域风骨与人文底蕴。
              从太姥山的云雾茶园到沙埕港的渔舟唱晚，从千年非遗的活态传承到寻常巷陌的烟火气息，每一寸土地都藏着值得细品的故事。
            </p>
          </header>

          <div class="content-block">
            <h2 class="section-title">地理风貌：山海相拥的灵秀之地</h2>
            <p class="lead">
              福鼎的美，始于山水的馈赠。境内地形兼具山地、丘陵与滨海平原，西北倚靠洞宫山余脉，东南濒临东海，形成 “七山二水一分田” 的独特格局。最负盛名的太姥山，作为国家级风景名胜区，峰峦叠嶂、怪石嶙峋，常年云雾缭绕，海拔 917 米的摩霄峰更是俯瞰山海的绝佳去处。这里不仅有 “夫妻峰”“一线天” 等奇景，更因陆羽《茶经》中 “永嘉县东三百里有白茶山” 的记载，成为福鼎白茶的核心产区 —— 山间常年平均气温 18℃，年降水量达 2000 毫米，疏松肥沃的红壤与充沛的云雾滋养，让每一片茶叶都凝聚着天地精华。
            </p>
            <p class="p">
              除了名山，福鼎的海岸线同样迷人。长达 432.7 公里的海岸线上，沙埕港、晴川湾等天然港湾星罗棋布，海域盛产蛏、海蛎、梭子蟹等海鲜，构成了 “靠海吃海” 的民生底色。而散落于山海之间的古村落，更添韵味：管阳镇西昆村作为江南最大的孔子后裔聚集地，保留着孔氏家庙与古民居，儒家文化与闽东民俗在此共生；磻溪镇仙蒲村藏于深山，四面环山、溪水流淌，南宋以来的古建筑与古道路，见证着山间岁月的悠长。
            </p>
          </div>

          <div class="content-block">
            <h2 class="section-title">风土人情：烟火与传承交织的生活图景</h2>
            <p class="lead">
              福鼎的魅力，更在于人与土地的共生共鸣。在这里，千年传承的非遗技艺、热闹鲜活的民俗节庆与烟火缭绕的特色美食，共同构成了最动人的生活画卷。
            </p>

            <h3 class="sub-title">非遗之光：流淌的文化基因</h3>
            <p class="p">
              作为拥有三项国家级非遗的城市，福鼎的传统技艺从未褪色。“福鼎白茶制作技艺” 以 “不炒不揉” 的古法，经萎凋、干燥两道核心工序，将鲜叶化为白毫银针、白牡丹等珍品，2011 年入选国家级非遗名录，如今仍有茶农坚守着 “背阳晾晒、自然萎凋” 的古老智慧。沙埕铁枝则是元宵佳节的视觉盛宴，钢管焊接而成的 “铁枝” 上，孩童装扮成戏曲人物，在行进中演绎故事，融合了戏曲、杂技等艺术元素，延续着数百年的民俗狂欢。而瑞云 “四月八” 歌会，又称 “牛歇节”，畲族同胞设坛祭祀、放声对歌，同时为耕牛备好美食，既纪念先贤，又感恩自然馈赠，尽显畲乡风情。
            </p>

            <h3 class="sub-title">民俗之盛：鲜活的人间烟火</h3>
            <p class="p">
              福鼎的节庆始终充盈着热闹与温情。正月里，管阳镇的 “翻九楼” 堪称民俗奇观，九张八仙桌叠成十米高塔，表演者逐层攀爬至顶，在米筛上完成旋转、行走等惊险动作，祈福纳祥，展现着闽东人民的勇气与信仰。双华 “二月二” 畲族会亲节上，畲胞身着民族服装，抬着神像游行，举办盛大宴会，亲友团聚、笙歌不断，延续着近四百年的团圆传统。平日里，古城街巷中更有别样热闹：桐山桥头的锅边糊摊冒着热气，十字街的粿汤香气四溢，江记鱼片的酸辣滋味挑逗味蕾 —— 这些特色美食，正是福鼎人日常生活的烟火注脚。
            </p>

            <h3 class="sub-title">茶韵之深：融入血脉的生活哲学</h3>
            <p class="p">
              在福鼎，茶早已超越饮品的范畴，成为融入血脉的文化符号。“茶哥米弟” 的俗语，道尽了白茶在当地人心中的分量：建房上梁要挂茶祈福，女儿出嫁要以陈年白茶为嫁妆，贵客到访必以白毫银针相待。畲族家庭更有独特的 “陪嫁茶” 习俗，女儿出生时封存一罐白茶，待出嫁时作为信物送出，让茶香承载着父母的牵挂与祝福。如今，31.9 万亩茶园遍布山海之间，茶农们日出而作，将鲜嫩茶芽摊在竹簸箕上，等待阳光与微风的雕琢，而这份与自然和谐共处的智慧，也让福鼎白茶成为连接传统与现代的文化纽带。
            </p>

            <div class="closing">
              <h3 class="closing-title">山海为骨，文化为魂</h3>
              <p class="closing-text">
                山海为骨，文化为魂。福鼎的美，是太姥山云雾中的茶韵，是古村落里的岁月静好，是非遗技艺中的匠心坚守，更是寻常生活里的烟火温情。这座被山水与茶香滋养的城市，正以温润的姿态，邀请每一位来客，探寻它深藏的故事与韵味。
              </p>
            </div>
          </div>
        </article>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { onBeforeUnmount, ref, onMounted } from 'vue'

export default {
  name: 'FudingCultureIntro',
  setup() {
    const backgroundImages = ref([
      '/images/太姥山云雾茶园.jpg',
      '/images/潋城城堡晨雾.jpg',
      '/images/沙埕港落日.jpg',
      '/images/畲族村寨风情.jpg',
      '/images/白茶萎凋竹匾.jpg'
    ])

    const bgFallback = '/images/福鼎白茶.jpg'
    const activeBgIndex = ref(0)
    let timer = null

    const onBgImageError = (event) => {
      event.target.src = bgFallback
    }

    const startRotate = () => {
      timer = setInterval(() => {
        activeBgIndex.value = (activeBgIndex.value + 1) % backgroundImages.value.length
      }, 4200)
    }

    onMounted(() => {
      startRotate()
    })

    onBeforeUnmount(() => {
      if (timer) clearInterval(timer)
    })

    return {
      backgroundImages,
      activeBgIndex,
      onBgImageError
    }
  }
}
</script>

<style scoped>
.fuding-culture-intro {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

.fuding-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.fuding-bg-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 1.2s ease;
  transform: scale(1.08);
  filter: saturate(1.05) brightness(0.86);
}

.fuding-bg-img.active {
  opacity: 1;
}

.fuding-bg-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(102, 126, 234, 0.55) 0%,
    rgba(118, 75, 162, 0.38) 45%,
    rgba(245, 93, 108, 0.22) 100%
  );
}

.fuding-content-wrap {
  position: relative;
  z-index: 1;
}

.fuding-main {
  padding: 0;
  min-height: calc(100vh - 72px);
}

.article {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-xl) 70px;
}

.hero-content {
  padding: 80px 0 26px;
  color: white;
}

.hero-kicker {
  display: inline-block;
  font-size: 14px;
  opacity: 0.95;
  background: rgba(255, 255, 255, 0.14);
  padding: 8px 14px;
  border-radius: var(--radius-full);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.hero-title {
  margin: 18px 0 0;
  font-size: var(--font-size-3xl);
  font-weight: 800;
  letter-spacing: -1px;
  line-height: 1.1;
}

.hero-subtitle {
  margin: 16px 0 0;
  max-width: 720px;
  font-size: 16px;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.92);
}

.section-title {
  margin: 0;
  font-size: 30px;
  font-weight: 800;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.lead {
  margin: 16px 0 26px;
  color: var(--text-regular);
  font-size: 16px;
  line-height: 1.9;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(0, 0, 0, 0.04);
  border-radius: var(--radius-lg);
  padding: 18px 18px;
}

.p {
  margin: 14px 0 0;
  color: var(--text-regular);
  font-size: 16px;
  line-height: 1.95;
  background: rgba(255, 255, 255, 0.64);
  border: 1px solid rgba(0, 0, 0, 0.03);
  border-radius: var(--radius-lg);
  padding: 14px 18px;
}

.content-block {
  margin-top: 26px;
}

.sub-title {
  margin: 22px 0 0;
  font-size: 18px;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.2px;
}

.closing {
  margin-top: 36px;
  padding: 26px;
  border-radius: var(--radius-xl);
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.closing-title {
  margin: 0 0 10px;
  font-size: 20px;
  font-weight: 800;
  color: var(--text-primary);
}

.closing-text {
  margin: 0;
  color: var(--text-regular);
  line-height: 1.9;
  font-size: 15px;
}

@media (max-width: 768px) {
  .article {
    padding: 0 16px 50px;
  }

  .hero-content {
    padding: 72px 0 18px;
  }

  .section-title {
    font-size: 24px;
  }
}
</style>
