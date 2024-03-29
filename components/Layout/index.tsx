import type { NextPage } from 'next';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';

import styles from './index.module.scss';
import { Navbar } from '~/components/Navbar';
import GridIcon from '~/assets/images/grid.svg';

const Cube: React.FC = () => (
  <div className={styles.cube}>
    <div>
      <div className={styles.cube_inner}>
        <h4>8月1日</h4>
        <p>我多了一个家人。</p>
        <p>虽然帮他在门外面准备了床，但MADAO还是一如既往的没有发芽，就只是凝望着天空，从那干涸的双眸中，没什么都感觉不到，就好像神明也无法理解下凡的堕天使路西法一样，我终于厌烦了。</p>
        <p>人若不是随着环境变化就无法生存，替下脚步拒绝变化的那个男人，早已如同尸体一般。</p>

        <h4>8月3日</h4>
        <p>我把从母亲那偷来的威士忌随手丢给了他。</p>
        <p>MADAO，我已经帮你改变了环境了，接下来就看你自己的了，但为什么你还是那样停滞不前，你到底在不满些什么？</p>
        <p>就算这么问了，MADAO却还是苦着一张脸，喝着威士忌。</p>
        <p>到底什么时候MADAO才会开花呢？</p>
        <p>天仿佛是在嘲笑仰望天空的我一样，上空盘旋着一只秃鹰。。。</p>

        <h4>8月10日</h4>
        <p>从开始培育MADAO到现在已经有十天了，还是老样子没有发芽。</p>
        <p>我还是老样子，把从母亲那偷来的威士忌酒随手丢给了他。最近母亲似乎很在意MADAO，看来他已经感觉到了我养的不是狗而是MADAO。</p>
        <p>孤身一人将我抚养大的母亲，母亲是从什么时候开始不信任男人的呢？</p>
        <p>那是3年前的8月10日。</p>
        <p>我还记得那是一个热得仿佛连人都能熔化的日子，母亲的丈夫，也就是我的父亲，也是一个MADAO。</p>
        <p>父亲曾是一个巧手的木工，但却在工地遇到事故而丧失了手臂的功能，于是他开始不工作、从早到晚喝酒赌博。</p>
        <p>母亲为了支付父亲玩乐的花费而辛辛苦苦地工作，但是因为工资太低，总被父亲打骂。我讨厌看见那样的父亲，所以等到太阳下山才回家，等劳累了一天的母亲一起回家，这是我的日常。即使变成了那样的MADAO，我们去还没有抛弃他。</p>
        <p>那是因为，我们遥远的记忆，那个温柔的父亲和丈夫会回到我们身边。</p>
        <p>但是那一天……我们的希望，伴随着蝉鸣，消失在了夏空中……</p>

        <h4>8月12日</h4>
        <p>结果到最后还是没能找到MADAO，总觉得头好痛，痛到不能像之前那样好好写字，我好像感冒了。不知道为什么，明明没有喝酒，眼睛却流出了酒，就像MADAO那样。MADAO是不是也在什么地方流着酒啊。我一直这样想着酒流不止。</p>
        <p>当发觉发现不知什么时候起MADAO就坐在我的床边时，</p>
        <p>我说：M、MADAO。</p>
        <p>妈妈说：真是的，这一次要好好看着别再让他跑了，还有就是，要养MADAO的话就在家里养，养在外面太丢脸了。别老是给他喝酒，也要喂他些正常的东西。</p>
        <p>我：妈妈允许我养MADAO了？不，说不定妈妈的想法和我是一样的……MADAO，你又喝酒了？</p>
        <p>MADAO流着泪说：不，不会再喝了。</p>
      </div>
    </div>
    <div />
    <div />
    <div>
      <div className={styles.cube_inner}>
        <h1>MADAO的观察日记</h1>
        <p>三年一组 大五郎</p>

        <h4>7月1日</h4>
        <p>明天就是期待已久的暑假，明天该玩什么呢？睡觉之前想着想着兴奋不已，错过了广播体操。去公园已经没人在了，但是在那里，和我的MADAO相遇了。</p>

        <h4>7月21日</h4>
        <p>从今天开始记录MADAO观察日记。</p>
        <p>MADAO是公园的主人，长着胡子戴着太阳镜的生物，基本上整天不出去工作呆在公园里。昨天从家里把酒带来以后，终于拉近了关系和我说话了。</p>
        <p>因为他说没有酒就活不下去，我给了MADAO很多酒。</p>
        <p>什么时候MADAO才能开花呢？</p>

        <h4>7月22日</h4>
        <p>MADAO还是没发芽。</p>
        <p>不管给他多少酒，他还是既不工作又不动。当我问他“你为什么什么都不干？”的时候，</p>
        <p>MADAO说：枯萎过一次的花，是不可能再次绽放的。</p>

        <h4>7月23日</h4>
        <p>MADAO还是没有发芽。</p>
        <p>不管给他多少酒，都会从他的眼睛里流出来。当我问他“为什么好心给你的酒都流出来了呢？”</p>
        <p>MADAO说：对不起，再也不会流出来了，对不起啊。</p>
        <p>一边说着，一边继续从眼睛里流出来，一直到了太阳下山。</p>

        <h4>7月24日</h4>
        <p>MADAO还是没有发芽。</p>
        <p>MADAO好像受伤了，所以我问他“你怎么了？”</p>
        <p>他说“我打算做个秋千但是失败了。”</p>
        <p>我不可思议的问“为什么公园里已经有秋千了还要再做一个呢？”</p>
        <p>MADAO到底要到什么时候才会开花呢？</p>

        <h4>7月25日</h4>
        <p>MADAO还是没有发芽，当我去做广播体操的时候，看见MADAO睡在铁轨上。</p>
        <p>我问他“你在干什么？”</p>
        <p>他说“睡不着，不知道为什么就滚到那里去了”</p>
        <p>到底什么时候MADAO才能开花呢？</p>
      </div>
    </div>
    <div>
      <div className={styles.cube_inner}>
        <h4>8月20日</h4>
        <p>那之后MADAO就变了，不再喝酒，整个人都变得干净整洁，妈妈不在的时候把所有的家务都做完了，而且在闲暇的时候还看招聘杂志。妈妈一开始喊他做MADAO，但是最近也喊他做长谷川先生了。</p>
        <p>明明MADAO就是MADAO啊，我搞不太明白。</p>

        <h4>8月25日</h4>
        <p>MADAO去跑腿买东西的时候，妈妈突然说“大五郎，你想要一个爸爸吗？”这样问我。因为不知道是什么意思我就反问了，结果她脸红了“不，没什么。”</p>
        <p>因为搞不清楚所以晚上就问了一下MADAO。</p>
        <p>MADAO转过身去：“谁知道呢”</p>
        <p>大人还真是难懂啊。</p>

        <h4>8月26日</h4>
        <p>终于到了MADAO发芽的日子。</p>
        <p>MADAO：一直以来谢谢你们了。多亏了你们我才能从低谷中再次爬起来，我真的不知道该如何谢谢你们了。</p>
        <p>妈妈：真是的，你太心急了。接下来你要去面试吧，领带都没打好呢。</p>
        <p>说着便伸手去为MADAO打领带。</p>
        <p>MADAO红了脸：不好意思。</p>
        <p>妈妈：面试是只有一个人才能通过的难关吧，请加油，我们等你的好消息。</p>
        <p>MADAO：好！</p>
        <p>奔赴决战的MADAO和目送他远去的妈妈，简直就像是爸爸和妈妈一样。MADAO是爸爸，光是想想就觉得挺奇怪的，放弃不想了。</p>
      </div>
    </div>
    <div />
  </div>
);

export const Layout: NextPage<React.PropsWithChildren> = props => {
  const router = useRouter();

  const [visibleGoTop, setVisibleGoTop] = React.useState(false);

  const scrollElementRef = React.useRef<HTMLDivElement | null>(null);
  const scrollTimer = React.useRef(0);

  const handleScroll: React.UIEventHandler<HTMLDivElement> = () => {
    if (scrollTimer.current) {
      return;
    }

    scrollTimer.current = window.setTimeout(() => {
      window.clearTimeout(scrollTimer.current);
      scrollTimer.current = 0;

      if ((scrollElementRef.current?.scrollTop ?? 0) < 300) {
        setVisibleGoTop(false);
      }
    }, 10);

    setVisibleGoTop((scrollElementRef.current?.scrollTop ?? 0) > 300);
  };

  React.useLayoutEffect(() => {
    if (router.pathname === '/notes/[id]') {
      scrollElementRef.current?.scroll({ top: 0 });
    }
  }, [router.pathname]);

  return (
    <div className={styles.container}>
      <div className={styles.bg}>
        { /* 感觉太花里胡哨了，所以暂时隐藏 */ }
        {/* <Cube /> */}
        <GridIcon className={styles.grid} />
        { /* 感觉太花里胡哨了，所以暂时隐藏 */ }
        {/* <div className={styles.slogan}>
          <h2>Don&apos;t</h2>
          <h2>Be</h2>
          <h2>Afraid</h2>
          <h2>Of</h2>
          <h2>Anyone</h2>
        </div> */}
      </div>
      <Navbar />
      <main className={styles.main}>
        <div
          className={styles.inner}
          ref={scrollElementRef}
          onScroll={handleScroll}
        >
          {props.children}
        </div>
        <div className={styles.inner_bg} />
      </main>

      <div className={styles.footer}>
        <a
          href='https://beian.miit.gov.cn'
          target='_blank'
          rel='noreferrer'
        >
              陇ICP备2021003360号-1
        </a>
        <div>
          <a className={styles.record} target='_blank' href='http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=62042302000165' rel='noreferrer'>
            <Image src='/images/record_icon.png' width={15} height={15} alt='record icon' />
            <p>甘公网安备 62042302000165号</p>
          </a>
        </div>
      </div>

      {visibleGoTop && (
        <div
          className={styles.go_top}
          onClick={() => scrollElementRef.current?.scroll({ top: 0, behavior: 'smooth' })}
        />
      )}
    </div>
  );
};
