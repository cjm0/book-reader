/* 模拟数据 - 本地开发包 */

export default {
  deviceInfo: {
    brand: "HONOR",
    browserVersion: "14.0.3.200",
    deviceType: "1",
    language: "zh_CN",
    manufacturer: "HUAWEI",
    model: "OXF-AN10",
    osVersion: "10",
  },
  networkInfo: {
    connected: true,
    type: "1"
  },

  // 书籍进度
  bookProgress: {
    // 阅文书籍id：22114917000488502-国士 22376031000468402-庆余年 22357181000109902-仙逆
    readProgress: { //
      chapterId: "96023477205090387",
      horizontalOffset: "2",
      verticalOffset: "0_84_11",
      chapterIndex: "1564",
      chapterName: "第十五章 怀疑",
      maxChapterId: "8452184014618959",
      maxChapterIndex: "1564",
    },
    readProgress: null,
    subscribeInfo: {
      subscribeStatus: 0
    }
  },
  // 书籍信息
  bookInfo: {
    "hwBookId": "19074c9a951f2072b6b33f6315421d56",
    "ebookBasicInfo": {
      "author": {
        "authorName": "笑我轻狂"
      },
      "categoryList": [
        {
          "categoryCode": "5001010000",
          "categoryName": "玄幻",
          "subCategoryName": "东方玄幻"
        }
      ],
      "cover": {
        "url": "https://lfcontentcenterdev.hwcloudtest.cn/img/pub_5/Browser_smallCard_1560_8/dc/v3/104156022021087000953402/a71c0080a05249549ccceba6b066195f_1_0/hd.webp"
      },
      "ebookLabels": "[{\"labelId\":51000014,\"labelName\":\"无敌流\"},{\"labelId\":51000117,\"labelName\":\"武道\"},{\"labelId\":510001073,\"labelName\":\"至尊流\"}]",
      "finished": 1,
      "introduction": "      神秘残塔，开启武者宝藏。\r\n　　吞天之术，问鼎至尊武神！\r\n　　拳出，天下惊！\r\n　\r\n",
      "maxChapterId": "7340458039575211",
      "maxChapterIndex": 539,
      "maxChapterName": "第五百六十六章 至尊武神（全书完）",
      "name": "至尊武神",
      "wordCount": 1364866,
      "dataRealTime": 1706079027051
    },
    "ebookStatisticInfo": {
      "hotValue": 5004990,
      "readUsers": 500241,
      "score": "9.7",
      "dataRealTime": 1706079027051
    }
  },
  bookInfo: null,

  // 插页-广告配置
  novelInsideAdConfig: {
    startChapter: 1,
    showAdInterval: 3,
    rewardAdConfig: {
      rewardSlotId: '12132',
      rewardText: '看视频免30分钟广告',
      rewardTime: '1',
    },
    lockChapterConfig: { // 配置-锁章
      lockChapterInterval: 2,	// 锁章间隔，间隔X章出锁章插页
      lockChapterTime: 5,	// 锁章时间，单位s
    }
  },

  // 固底-广告配置
  novelBottomAdConfig: {
    reloadAdSeconds: 30, // 间隔刷新 s
    reShowAdSeconds: 10, // 关闭后刷新 s
  },

  // 公告-广告配置
  bannerAdConfig: {
    num: 10, // 每天最大的展示次数
    inter: 1, // 两个公告页之间的最小展示间隙 min
  },

  // 章末-广告配置
  chapterBottomAdConfig: {
    cpIdCode: '',
    rewardAdConfig: {
      rewardSlotId: '12132',
      rewardText: '看视频免30分钟广告',
      rewardTime: '1',
    },
  },

  // 广告素材模拟，3-大图 6-视频 7-小图 8-三小图
  mockAdBottom1: {
    isTemplateAd: false,
    templateId: 'LOCAL_Native_Small_Bottom_Image',
    adId: 'testb65czjivt9',
    slotId: '243324234234',
    creativeType: 107,
    title: '男士休闲鞋，轻便透气，防滑耐磨，不容错过，免费试穿',
    app: {
      appName: '原神·2.4 版本海灯节',
      appDesc: '米哈游开放世界冒险RPG长',
      iconUrl: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fi-2.tts8.com%2F2020%2F1025%2F285d69b8f11e4958aec19f316645a02f.png&refer=http%3A%2F%2Fi-2.tts8.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1671092362&t=7505512ca72acabf0b6bad833b99d56d',
      packageName: 'taobao.package.com',
    },
    imgList: [
      // {
      //   width: 640,
      //   height: 960,
      //   url: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fpic1.win4000.com%2Fmobile%2Fe%2F5577f8775b105.png&refer=http%3A%2F%2Fpic1.win4000.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1671086398&t=26d033026f3e303825dc16984165f062',
      // },
      {
        width: 1280,
        height: 720,
        url: 'https://img2.baidu.com/it/u=952283898,2906583004&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=281',
      },
      // {
      //   width: 1280,
      //   height: 720,
      //   url: 'https://img2.baidu.com/it/u=952283898,2906583004&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=281',
      // },
      // {
      //   width: 1280,
      //   height: 720,
      //   url: 'https://img2.baidu.com/it/u=952283898,2906583004&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=281',
      // },
    ],
    // video: {
    //   duration: 16000,
    //   ratio: 1.4,
    //   url: 'https://r10---sn-ni57rn7e.c.2mdn.net/videoplayback/id/58f2c4e39d2853f8/itag/343/source/doubleclick_dmm/ctier/L/acao/yes/ip/0.0.0.0/ipbits/0/expire/3791978042/sparams/acao,ctier,expire,hcs,id,ip,ipbits,itag,mh,mip,mm,mn,ms,mv,mvi,pl,rmhost,smhost,source/signature/6BADCB83DD6B04A4B1696CDB0E629AA9CCB29607.7A46C1EDD6FAA10B688C03B3A272B98492295379/key/cms1/cms_redirect/yes/hcs/sd/mh/Pk/mip/119.147.10.188/mm/42/mn/sn-ni57rn7e/ms/onc/mt/1667890135/mv/m/mvi/10/pl/19/rmhost/r12---sn-ni57rn7e.c.2mdn.net/smhost/r7---sn-ni57rn76.c.2mdn.net/file/file.mp4',
    // },
    video: {
      duration: 17,
      ratio: 0.6,
      url: 'http://aod.cos.tx.xmcdn.com/group69/M09/88/13/wKgMeV2v6hegVWaFABQf5kc7Dd8337.mp4',
    },
    clickBtnTxt: '下 载',
    keywords: [
      '不喜欢该广告',
      '不喜欢该品牌',
      '不喜欢该行业',
      '重复出现',
      '内容质量差',
      '内容质量很差',
    ],
    source: 'AITO 问界',
  },
  mockAdBottom2: {
    isTemplateAd: false,
    templateId: 'LOCAL_Native_Small_Bottom_Image',
    adId: 'testb65czjivt9',
    slotId: '243324234234',
    creativeType: 107, // 3-大图 6-视频 7-小图 8-三小图
    title: '男士休闲鞋，轻便透气，防滑耐磨，不容错过，免费试穿22222222',
    // app: {
    //   appName: '原神·2.4 版本海灯节222222222',
    //   appDesc: '米哈游开放世界冒险RPG长22222222',
    //   iconUrl: 'https://img2.baidu.com/it/u=4171510179,442699747&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=281',
    //   packageName: 'taobao.package.com',
    // },
    imgList: [
      // {
      //   width: 640,
      //   height: 960,
      //   url: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fpic1.win4000.com%2Fmobile%2Fe%2F5577f8775b105.png&refer=http%3A%2F%2Fpic1.win4000.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1671086398&t=26d033026f3e303825dc16984165f062',
      // },
      {
        width: 1280,
        height: 720,
        url: 'https://img2.baidu.com/it/u=952283898,2906583004&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=281',
      },
      // {
      //   width: 1280,
      //   height: 720,
      //   url: 'https://img2.baidu.com/it/u=952283898,2906583004&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=281',
      // },
      // {
      //   width: 1280,
      //   height: 720,
      //   url: 'https://img2.baidu.com/it/u=952283898,2906583004&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=281',
      // },
    ],
    // video: {
    //   duration: 16000,
    //   ratio: 1.4,
    //   url: 'https://r10---sn-ni57rn7e.c.2mdn.net/videoplayback/id/58f2c4e39d2853f8/itag/343/source/doubleclick_dmm/ctier/L/acao/yes/ip/0.0.0.0/ipbits/0/expire/3791978042/sparams/acao,ctier,expire,hcs,id,ip,ipbits,itag,mh,mip,mm,mn,ms,mv,mvi,pl,rmhost,smhost,source/signature/6BADCB83DD6B04A4B1696CDB0E629AA9CCB29607.7A46C1EDD6FAA10B688C03B3A272B98492295379/key/cms1/cms_redirect/yes/hcs/sd/mh/Pk/mip/119.147.10.188/mm/42/mn/sn-ni57rn7e/ms/onc/mt/1667890135/mv/m/mvi/10/pl/19/rmhost/r12---sn-ni57rn7e.c.2mdn.net/smhost/r7---sn-ni57rn76.c.2mdn.net/file/file.mp4',
    // },
    video: {
      duration: 17,
      ratio: 0.6,
      url: 'http://aod.cos.tx.xmcdn.com/group69/M09/88/13/wKgMeV2v6hegVWaFABQf5kc7Dd8337.mp4',
    },
    clickBtnTxt: '下 载',
    keywords: [
      '不喜欢该广告',
      '不喜欢该品牌',
      '不喜欢该行业',
      '重复出现',
      '内容质量差',
      '内容质量很差',
    ],
    source: 'AITO 问界',
  },
  mockAdData3: {
    /*
      3-大图 testu7m3hc4gvm
      6-视频 testy63txaom86
      7-小图 testb65czjivt9
      8-三小图 testr6w14o0hqz

      templateId
      LOCAL_Native_16_9_Image
      LOCAL_Native_Small_Image
      LOCAL_Native_3_Image
      LOCAL_Native_Icon_Image
      LOCAL_Native_16_9_Video
      LOCAL_Native_Small_Bottom_Image
      LOCAL_Native_9_16_Video
    */
    isTemplateAd: false,
    templateId: 'LOCAL_Native_3_Image',
    adId: 'testb65czjivt3',
    slotId: '243324234234',
    creativeType: 107,
    title: '男士休闲鞋，轻便透气，防滑耐磨，不容错过，免费试穿',
    app: {
      appDesc: "理财借贷分期保险一站式平台",
      appName: "京东金融",
      developerName: "京东科技控股股份有限公司",
      iconUrl: "https://appimg.dbankcdn.com/application/icon144/e0e1b1027bf64022acfd564ba73f371f.webp",
      packageName: "com.jd.jrapp3",
      appDetailUrl: "https://appgallery.huawei.com/#/app_simple/C10230847",
      permissionUrl: "https://appgallery.huawei.com/open/permission?packageName=com.jd.jrapp&mediaPackageName=com.huawei.browser",
      privacyLink: "https://h5hosting-drcn.dbankcdn.cn/cch5/PPS/ssp-privacy-url/index.html?src=https%3A%2F%2Fh5.m.jd.com%2Fdev%2Fr6GfckUwQej2Y4JK3nn1whkLv2k%2Findex.html",
      versionName: "6.7.90",
    },
    imgList: [
      {
        width: 640,
        height: 960,
        url: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fpic1.win4000.com%2Fmobile%2Fe%2F5577f8775b105.png&refer=http%3A%2F%2Fpic1.win4000.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1671086398&t=26d033026f3e303825dc16984165f062',
      },
      {
        width: 1080,
        height: 607,
        url: 'https://lmg.jj20.com/up/allimg/1114/040221103339/210402103339-8-1200.jpg',
      },
      {
        width: 1280,
        height: 720,
        url: 'https://img2.baidu.com/it/u=952283898,2906583004&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=281',
      },
      // {
      //   width: 1280,
      //   height: 720,
      //   url: 'https://img2.baidu.com/it/u=952283898,2906583004&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=281',
      // },
    ],
    // video: {
    //   duration: 16000,
    //   ratio: 1.4,
    //   url: 'https://r10---sn-ni57rn7e.c.2mdn.net/videoplayback/id/58f2c4e39d2853f8/itag/343/source/doubleclick_dmm/ctier/L/acao/yes/ip/0.0.0.0/ipbits/0/expire/3791978042/sparams/acao,ctier,expire,hcs,id,ip,ipbits,itag,mh,mip,mm,mn,ms,mv,mvi,pl,rmhost,smhost,source/signature/6BADCB83DD6B04A4B1696CDB0E629AA9CCB29607.7A46C1EDD6FAA10B688C03B3A272B98492295379/key/cms1/cms_redirect/yes/hcs/sd/mh/Pk/mip/119.147.10.188/mm/42/mn/sn-ni57rn7e/ms/onc/mt/1667890135/mv/m/mvi/10/pl/19/rmhost/r12---sn-ni57rn7e.c.2mdn.net/smhost/r7---sn-ni57rn76.c.2mdn.net/file/file.mp4',
    // },
    video: {
      duration: 17,
      ratio: 0.6,
      url: 'http://aod.cos.tx.xmcdn.com/group69/M09/88/13/wKgMeV2v6hegVWaFABQf5kc7Dd8337.mp4',
    },
    clickBtnTxt: '下 载',
    keywords: [
      '不喜欢该广告',
      '不喜欢该品牌',
      '不喜欢该行业',
      '重复出现',
      '内容质量差',
      '内容质量很差',
    ],
    source: 'AITO 问界',
  },
  mockAdData4: {
    /*
      3-大图 testu7m3hc4gvm
      6-视频 testy63txaom86
      7-小图 testb65czjivt9
      8-三小图 testr6w14o0hqz

      templateId
      LOCAL_Native_16_9_Image
      LOCAL_Native_Small_Image
      LOCAL_Native_3_Image
      LOCAL_Native_Icon_Image
      LOCAL_Native_16_9_Video
      LOCAL_Native_Small_Bottom_Image
      LOCAL_Native_9_16_Video
    */
    isTemplateAd: false,
    templateId: 'LOCAL_Native_3_Image',
    adId: 'testb65czjivt94',
    slotId: '243324234234',
    creativeType: 107,
    title: '男士休闲鞋，轻便透气，防滑耐磨，不容错过，免费试穿',
    app: {
      appDesc: "理财借贷分期保险一站式平台",
      appName: "京东金融4",
      developerName: "京东科技控股股份有限公司",
      iconUrl: "https://appimg.dbankcdn.com/application/icon144/e0e1b1027bf64022acfd564ba73f371f.webp",
      packageName: "com.jd.jrapp4",
      appDetailUrl: "https://appgallery.huawei.com/#/app_simple/C10230847",
      permissionUrl: "https://appgallery.huawei.com/open/permission?packageName=com.jd.jrapp&mediaPackageName=com.huawei.browser",
      // privacyLink: "https://h5hosting-drcn.dbankcdn.cn/cch5/PPS/ssp-privacy-url/index.html?src=https%3A%2F%2Fh5.m.jd.com%2Fdev%2Fr6GfckUwQej2Y4JK3nn1whkLv2k%2Findex.html",
      // versionName: "6.7.90",
    },
    imgList: [
      {
        width: 640,
        height: 960,
        url: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fpic1.win4000.com%2Fmobile%2Fe%2F5577f8775b105.png&refer=http%3A%2F%2Fpic1.win4000.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1671086398&t=26d033026f3e303825dc16984165f062',
      },
      {
        width: 1080,
        height: 607,
        url: 'https://lmg.jj20.com/up/allimg/1114/040221103339/210402103339-8-1200.jpg',
      },
      {
        width: 1280,
        height: 720,
        url: 'https://img2.baidu.com/it/u=952283898,2906583004&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=281',
      },
      // {
      //   width: 1280,
      //   height: 720,
      //   url: 'https://img2.baidu.com/it/u=952283898,2906583004&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=281',
      // },
    ],
    // video: {
    //   duration: 16000,
    //   ratio: 1.4,
    //   url: 'https://r10---sn-ni57rn7e.c.2mdn.net/videoplayback/id/58f2c4e39d2853f8/itag/343/source/doubleclick_dmm/ctier/L/acao/yes/ip/0.0.0.0/ipbits/0/expire/3791978042/sparams/acao,ctier,expire,hcs,id,ip,ipbits,itag,mh,mip,mm,mn,ms,mv,mvi,pl,rmhost,smhost,source/signature/6BADCB83DD6B04A4B1696CDB0E629AA9CCB29607.7A46C1EDD6FAA10B688C03B3A272B98492295379/key/cms1/cms_redirect/yes/hcs/sd/mh/Pk/mip/119.147.10.188/mm/42/mn/sn-ni57rn7e/ms/onc/mt/1667890135/mv/m/mvi/10/pl/19/rmhost/r12---sn-ni57rn7e.c.2mdn.net/smhost/r7---sn-ni57rn76.c.2mdn.net/file/file.mp4',
    // },
    video: {
      duration: 17,
      ratio: 0.6,
      url: 'http://aod.cos.tx.xmcdn.com/group69/M09/88/13/wKgMeV2v6hegVWaFABQf5kc7Dd8337.mp4',
    },
    clickBtnTxt: '下 载',
    keywords: [
      '不喜欢该广告',
      '不喜欢该品牌',
      '不喜欢该行业',
      '重复出现',
      '内容质量差',
      '内容质量很差',
    ],
    source: 'AITO 问界',
  },
  mockAdData5: {
    /*
      3-大图 testu7m3hc4gvm
      6-视频 testy63txaom86
      7-小图 testb65czjivt9
      8-三小图 testr6w14o0hqz

      templateId
      LOCAL_Native_16_9_Image
      LOCAL_Native_Small_Image
      LOCAL_Native_3_Image
      LOCAL_Native_Icon_Image
      LOCAL_Native_16_9_Video
      LOCAL_Native_Small_Bottom_Image
      LOCAL_Native_9_16_Video
    */
    isTemplateAd: false,
    templateId: 'LOCAL_Native_3_Image',
    adId: 'testb65czjivt95',
    slotId: '243324234234',
    creativeType: 107,
    title: '男士休闲鞋，轻便透气，防滑耐磨，不容错过，免费试穿',
    app: {
      appDesc: "理财借贷分期保险一站式平台",
      appName: "京东金融5",
      developerName: "京东科技控股股份有限公司",
      iconUrl: "https://appimg.dbankcdn.com/application/icon144/e0e1b1027bf64022acfd564ba73f371f.webp",
      packageName: "com.jd.jrapp5",
      appDetailUrl: "https://appgallery.huawei.com/#/app_simple/C10230847",
      // permissionUrl: "https://appgallery.huawei.com/open/permission?packageName=com.jd.jrapp&mediaPackageName=com.huawei.browser",
      // privacyLink: "https://h5hosting-drcn.dbankcdn.cn/cch5/PPS/ssp-privacy-url/index.html?src=https%3A%2F%2Fh5.m.jd.com%2Fdev%2Fr6GfckUwQej2Y4JK3nn1whkLv2k%2Findex.html",
      versionName: "6.7.90",
    },
    imgList: [
      {
        width: 640,
        height: 960,
        url: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fpic1.win4000.com%2Fmobile%2Fe%2F5577f8775b105.png&refer=http%3A%2F%2Fpic1.win4000.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1671086398&t=26d033026f3e303825dc16984165f062',
      },
      {
        width: 1080,
        height: 607,
        url: 'https://lmg.jj20.com/up/allimg/1114/040221103339/210402103339-8-1200.jpg',
      },
      {
        width: 1280,
        height: 720,
        url: 'https://img2.baidu.com/it/u=952283898,2906583004&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=281',
      },
      // {
      //   width: 1280,
      //   height: 720,
      //   url: 'https://img2.baidu.com/it/u=952283898,2906583004&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=281',
      // },
    ],
    // video: {
    //   duration: 16000,
    //   ratio: 1.4,
    //   url: 'https://r10---sn-ni57rn7e.c.2mdn.net/videoplayback/id/58f2c4e39d2853f8/itag/343/source/doubleclick_dmm/ctier/L/acao/yes/ip/0.0.0.0/ipbits/0/expire/3791978042/sparams/acao,ctier,expire,hcs,id,ip,ipbits,itag,mh,mip,mm,mn,ms,mv,mvi,pl,rmhost,smhost,source/signature/6BADCB83DD6B04A4B1696CDB0E629AA9CCB29607.7A46C1EDD6FAA10B688C03B3A272B98492295379/key/cms1/cms_redirect/yes/hcs/sd/mh/Pk/mip/119.147.10.188/mm/42/mn/sn-ni57rn7e/ms/onc/mt/1667890135/mv/m/mvi/10/pl/19/rmhost/r12---sn-ni57rn7e.c.2mdn.net/smhost/r7---sn-ni57rn76.c.2mdn.net/file/file.mp4',
    // },
    video: {
      duration: 17,
      ratio: 0.6,
      url: 'http://aod.cos.tx.xmcdn.com/group69/M09/88/13/wKgMeV2v6hegVWaFABQf5kc7Dd8337.mp4',
    },
    clickBtnTxt: '下 载',
    keywords: [
      '不喜欢该广告',
      '不喜欢该品牌',
      '不喜欢该行业',
      '重复出现',
      '内容质量差',
      '内容质量很差',
    ],
    source: 'AITO 问界',
  },
  mockAdData6: {
    /*
      3-大图 testu7m3hc4gvm
      6-视频 testy63txaom86
      7-小图 testb65czjivt9
      8-三小图 testr6w14o0hqz

      templateId
      LOCAL_Native_16_9_Image
      LOCAL_Native_Small_Image
      LOCAL_Native_3_Image
      LOCAL_Native_Icon_Image
      LOCAL_Native_16_9_Video
      LOCAL_Native_Small_Bottom_Image
      LOCAL_Native_9_16_Video
    */
    isTemplateAd: false,
    templateId: 'LOCAL_Native_3_Image',
    adId: 'testb65czjivt96',
    slotId: '243324234234',
    creativeType: 107,
    title: '男士休闲鞋，轻便透气，防滑耐磨，不容错过，免费试穿',
    app: {
      appDesc: "理财借贷分期保险一站式平台",
      appName: "京东金融6",
      developerName: "京东科技控股股份有限公司",
      iconUrl: "https://appimg.dbankcdn.com/application/icon144/e0e1b1027bf64022acfd564ba73f371f.webp",
      packageName: "com.jd.jrapp6",
      //appDetailUrl: "https://appgallery.huawei.com/#/app_simple/C10230847",
      //permissionUrl: "https://appgallery.huawei.com/open/permission?packageName=com.jd.jrapp&mediaPackageName=com.huawei.browser",
      privacyLink: "https://h5hosting-drcn.dbankcdn.cn/cch5/PPS/ssp-privacy-url/index.html?src=https%3A%2F%2Fh5.m.jd.com%2Fdev%2Fr6GfckUwQej2Y4JK3nn1whkLv2k%2Findex.html",
      versionName: "6.7.90",
    },
    imgList: [
      {
        width: 640,
        height: 960,
        url: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fpic1.win4000.com%2Fmobile%2Fe%2F5577f8775b105.png&refer=http%3A%2F%2Fpic1.win4000.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1671086398&t=26d033026f3e303825dc16984165f062',
      },
      {
        width: 1080,
        height: 607,
        url: 'https://lmg.jj20.com/up/allimg/1114/040221103339/210402103339-8-1200.jpg',
      },
      {
        width: 1280,
        height: 720,
        url: 'https://img2.baidu.com/it/u=952283898,2906583004&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=281',
      },
      // {
      //   width: 1280,
      //   height: 720,
      //   url: 'https://img2.baidu.com/it/u=952283898,2906583004&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=281',
      // },
    ],
    // video: {
    //   duration: 16000,
    //   ratio: 1.4,
    //   url: 'https://r10---sn-ni57rn7e.c.2mdn.net/videoplayback/id/58f2c4e39d2853f8/itag/343/source/doubleclick_dmm/ctier/L/acao/yes/ip/0.0.0.0/ipbits/0/expire/3791978042/sparams/acao,ctier,expire,hcs,id,ip,ipbits,itag,mh,mip,mm,mn,ms,mv,mvi,pl,rmhost,smhost,source/signature/6BADCB83DD6B04A4B1696CDB0E629AA9CCB29607.7A46C1EDD6FAA10B688C03B3A272B98492295379/key/cms1/cms_redirect/yes/hcs/sd/mh/Pk/mip/119.147.10.188/mm/42/mn/sn-ni57rn7e/ms/onc/mt/1667890135/mv/m/mvi/10/pl/19/rmhost/r12---sn-ni57rn7e.c.2mdn.net/smhost/r7---sn-ni57rn76.c.2mdn.net/file/file.mp4',
    // },
    video: {
      duration: 17,
      ratio: 0.6,
      url: 'http://aod.cos.tx.xmcdn.com/group69/M09/88/13/wKgMeV2v6hegVWaFABQf5kc7Dd8337.mp4',
    },
    clickBtnTxt: '下 载',
    keywords: [
      '不喜欢该广告',
      '不喜欢该品牌',
      '不喜欢该行业',
      '重复出现',
      '内容质量差',
      '内容质量很差',
    ],
    source: 'AITO 问界',
  },
  mockAdBanner: {
    /*
      3-大图 testu7m3hc4gvm
      6-视频 testy63txaom86
      7-小图 testb65czjivt9
      8-三小图 testr6w14o0hqz

      templateId
      LOCAL_Native_16_9_Image
      LOCAL_Native_Small_Image
      LOCAL_Native_3_Image
      LOCAL_Native_Icon_Image
      LOCAL_Native_16_9_Video
      LOCAL_Native_Small_Bottom_Image
      LOCAL_Native_9_16_Video
    */
    isTemplateAd: false,
    templateId: 'LOCAL_Native_3_Image',
    adId: 'testy63txaom86',
    slotId: '243324234234',
    creativeType: 106,
    title: '男士休闲鞋，轻便透气，防滑耐磨，不容错过，免费试穿',
    app: {
      appName: '原神·2.4 版本海灯节',
      appDesc: '米哈游开放世界冒险RPG长',
      iconUrl: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fi-2.tts8.com%2F2020%2F1025%2F285d69b8f11e4958aec19f316645a02f.png&refer=http%3A%2F%2Fi-2.tts8.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1671092362&t=7505512ca72acabf0b6bad833b99d56d',
      packageName: 'taobao.package.com',
    },
    imgList: [
      {
        width: 640,
        height: 960,
        url: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fpic1.win4000.com%2Fmobile%2Fe%2F5577f8775b105.png&refer=http%3A%2F%2Fpic1.win4000.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1671086398&t=26d033026f3e303825dc16984165f062',
      },
      {
        width: 1080,
        height: 607,
        url: 'https://lmg.jj20.com/up/allimg/1114/040221103339/210402103339-8-1200.jpg',
      },
      {
        width: 1280,
        height: 720,
        url: 'https://img2.baidu.com/it/u=952283898,2906583004&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=281',
      },
      // {
      //   width: 1280,
      //   height: 720,
      //   url: 'https://img2.baidu.com/it/u=952283898,2906583004&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=281',
      // },
    ],
    // video: {
    //   duration: 16000,
    //   ratio: 1.4,
    //   url: 'https://r10---sn-ni57rn7e.c.2mdn.net/videoplayback/id/58f2c4e39d2853f8/itag/343/source/doubleclick_dmm/ctier/L/acao/yes/ip/0.0.0.0/ipbits/0/expire/3791978042/sparams/acao,ctier,expire,hcs,id,ip,ipbits,itag,mh,mip,mm,mn,ms,mv,mvi,pl,rmhost,smhost,source/signature/6BADCB83DD6B04A4B1696CDB0E629AA9CCB29607.7A46C1EDD6FAA10B688C03B3A272B98492295379/key/cms1/cms_redirect/yes/hcs/sd/mh/Pk/mip/119.147.10.188/mm/42/mn/sn-ni57rn7e/ms/onc/mt/1667890135/mv/m/mvi/10/pl/19/rmhost/r12---sn-ni57rn7e.c.2mdn.net/smhost/r7---sn-ni57rn76.c.2mdn.net/file/file.mp4',
    // },
    video: {
      duration: 17,
      ratio: 0.6,
      url: 'http://aod.cos.tx.xmcdn.com/group69/M09/88/13/wKgMeV2v6hegVWaFABQf5kc7Dd8337.mp4',
    },
    clickBtnTxt: '下 载',
    keywords: [
      '不喜欢该广告',
      '不喜欢该品牌',
      '不喜欢该行业',
      '重复出现',
      '内容质量差',
      '内容质量很差',
    ],
    source: 'AITO 问界',
  },

  // 推荐书籍
  showRecommendBooks: true,
  recommendBooks: [
    {
      "action": {
        "clickLinkList": [
          {
            "index": 0,
            "type": "0",
            "url": "https://uathwb-reader.yuewen.com/read/15884576905924704?app=hwbrowser&spm=01-01-HW_NOVEL_READER_RECOM_ZH-508-default-1-0-default&hwbid=7a5d5d932b8ee9bf39b62e7b10e6c52b&docid=104156015884576905924704&reqid=1065976458501699873901519"
          }
        ]
      },
      "cType": "ebook",
      "categoryList": [
        {
          "categoryCode": "5001060000",
          "categoryName": "都市异术",
          "subCategoryName": "异术超能"
        }
      ],
      "channelId": "HW_NOVEL_READER_RECOM_ZH",
      "cpCooperationMode": 2,
      "dType": "84",
      "docExtInfo": "{\"dyScenario\":\"recomm\"}",
      "docTags": "31001#5001060000:0.8|31002#TP_100354:0.7,TP_100345:0.7,TP_100516:0.7,TP_100360:0.7,TP_100447:0.7,TP_100490:0.7,TP_100426:0.7|31022#50_都市之最强仙尊奶爸/nw/0.6,50_鸾一/nr/0.4|31004#|16003#鸾一|31027#|31028#|11033#鸾一|11041#都市之最强仙尊奶爸|11074#1",
      "ebookInfo": {
        cpExtInfo: "{\"randId\":20,\"randname\":\"必读榜\"}",
        "ebookBasicInfo": {
          "author": {
            "authorName": "鸾一"
          },
          "categoryList": [
            {
              "categoryCode": "5001060000",
              "categoryName": "都市异术",
              "subCategoryName": "异术超能"
            }
          ],
          "cover": {
            "url": "https://lfcontentcenterdev.hwcloudtest.cn/img/pub_5/Browser_bookCoverImg_300_3/27/v3/104156015884576905924704/5afcfbdf19c94912bb9e62f8c7b70b9d_1_0/hd.webp"
          },
          "ebookLabels": "[{\"labelId\":51000014,\"labelName\":\"无敌流\"},{\"labelId\":51000003,\"labelName\":\"重生\"},{\"labelId\":51000127,\"labelName\":\"现代修真\"},{\"labelId\":51000021,\"labelName\":\"软饭流\"},{\"labelId\":51000049,\"labelName\":\"奶爸\"},{\"labelId\":51000095,\"labelName\":\"都市修仙\"},{\"labelId\":53000027,\"labelName\":\"轻松\"}]",
          "finished": 1,
          "introduction": "新书启航《开局就能无限强化》eee呃呃求收藏。\r\n\r\n　　姜七姑娘生的花容月五年前林凡被人活活打死，身体去到仙界，复活过来。\n经过长达九万年的时光，终成为了仙界至尊。\n十万年，林凡找到了回家的路。\n撕破空间，回到了距离自己死去的五年后。\n回来的第一件事，就是找到当初那个已有身孕，那个深爱自己，自己也深爱她的女子。\n五年的时光，她诞下一女，取名为林宝瑾。\n林凡:昕昕，我是你爸爸\n昕昕:？？？\n回归之后，没想到蓝星有系统拥有者，重生者，还有修真者。\n本书单女主。",
          "maxChapterId": "48588178101602775",
          "maxChapterIndex": 645,
          "name": "都市之最强仙尊奶爸",
          "wordCount": 13496203
        },
        "ebookStatisticInfo": {
          "hotValue": 5002980,
          "readUsers": 513904,
          "score": "7.3"
        },
        "hwBookId": "7a5d5d932b8ee9bf39b62e7b10e6c52b",
        "readProgress": {
          "dataStatus": 1
        },
        "sdkStoreList": [
          "subscribeInfo",
          "readProgress",
          "ebookBasicInfo",
          "ebookStatisticInfo"
        ],
        "subscribeInfo": {
          "dataStatus": 1,
          "operationTime": 1684405645848,
          "subscribeStatus": 0
        }
      },
      "hwCpId": "1560",
      "hwDocId": "104156015884576905924704",
      "lpPageConfiguration": {
        "lpConfigFS": {
          "lpOpenStyle": {
            "skeletonType": 4
          },
          "preloadWeb": 1
        }
      },
      "mediaType": "180",
      "oriDocId": "15884576905924704",
      "sourceInfo": {
        "sourceId": "CP29f4145ab59567ca080bd199775434696",
        "sourceName": "鸾一"
      },
      "traceInfo": {
        "cpTrafficTraceInfo": "",
        "pipelineTraceInfo": "ebReader1560:44_1_cp1560_reader_recommend_policy1_ebook_thirdPatyReaderRecRuleId1_filterRuleReaderId1_null_null_null_null_null_null_null_null_null_null_null_null_\u0004\u0004\u0004\u0004\u000420230518102725\u0004\u0004\u0004\u0004\u00040\u0004\u0004\u0004\u0004\u0004\u0004\u00041_1560\u0004\u0004",
        "trafficTraceInfo": "{\"a\":\"01\",\"b\":\"01\",\"c\":\"01\",\"e\":\"0101999999\",\"f\":{\"f1\":\"HW_NOVEL_READER_RECOM_ZH|0|0\"},\"g\":{\"g1\":\"\",\"g2\":\"\",\"g3\":\"\",\"g4\":\"\",\"g5\":\"-1\",\"g6\":\"\",\"g7\":[],\"g8\":\"\",\"g9\":\"\"}}"
      },
      "ud": "1065976458501699873901519"
    },
    {
      "action": {
        "clickLinkList": [
          {
            "index": 0,
            "type": "0",
            "url": "https://uathwb-reader.yuewen.com/read/15884576905924704?app=hwbrowser&spm=01-01-HW_NOVEL_READER_RECOM_ZH-508-default-1-0-default&hwbid=7a5d5d932b8ee9bf39b62e7b10e6c52b&docid=104156015884576905924704&reqid=1065976458501699873901519"
          }
        ]
      },
      "cType": "ebook",
      "categoryList": [
        {
          "categoryCode": "5001060000",
          "categoryName": "都市",
          "subCategoryName": "异术超能"
        }
      ],
      "channelId": "HW_NOVEL_READER_RECOM_ZH",
      "cpCooperationMode": 2,
      "dType": "84",
      "docExtInfo": "{\"dyScenario\":\"recomm\"}",
      "docTags": "31001#5001060000:0.8|31002#TP_100354:0.7,TP_100345:0.7,TP_100516:0.7,TP_100360:0.7,TP_100447:0.7,TP_100490:0.7,TP_100426:0.7|31022#50_都市之最强仙尊奶爸/nw/0.6,50_鸾一/nr/0.4|31004#|16003#鸾一|31027#|31028#|11033#鸾一|11041#都市之最强仙尊奶爸|11074#1",
      "ebookInfo": {
        cpExtInfo: "{\"randId\":20,\"randname\":\"必读榜\"}",
        "ebookBasicInfo": {
          "author": {
            "authorName": "鸾一"
          },
          "categoryList": [
            {
              "categoryCode": "5001060000",
              "categoryName": "都市都市异术",
              "subCategoryName": "异术超能"
            }
          ],
          "cover": {
            "url": "https://lfcontentcenterdev.hwcloudtest.cn/img/pub_5/Browser_bookCoverImg_300_3/27/v3/104156015884576905924704/5afcfbdf19c94912bb9e62f8c7b70b9d_1_0/hd.webp"
          },
          "ebookLabels": "[{\"labelId\":51000014,\"labelName\":\"无敌流\"},{\"labelId\":51000003,\"labelName\":\"重生\"},{\"labelId\":51000127,\"labelName\":\"现代修真\"},{\"labelId\":51000021,\"labelName\":\"软饭流\"},{\"labelId\":51000049,\"labelName\":\"奶爸\"},{\"labelId\":51000095,\"labelName\":\"都市修仙\"},{\"labelId\":53000027,\"labelName\":\"轻松\"}]",
          "finished": 1,
          "introduction": "新书启航《开局就能无限强化》求收藏。\n五年前林凡被人活活打死，身体去到仙界，复活过来。\n经过长达九万年的时光，终成为了仙界至尊。\n十万年，林凡找到了回家的路。\n撕破空间，回到了距离自己死去的五年后。\n回来的第一件事，就是找到当初那个已有身孕，那个深爱自己，自己也深爱她的女子。\n五年的时光，她诞下一女，取名为林宝瑾。\n林凡:昕昕，我是你爸爸\n昕昕:？？？\n回归之后，没想到蓝星有系统拥有者，重生者，还有修真者。\n本书单女主。",
          "maxChapterId": "48588178101602775",
          "maxChapterIndex": 645,
          "name": "都市之最强仙尊奶爸2222",
          "wordCount": 1349620
        },
        "ebookStatisticInfo": {
          "hotValue": 5002980,
          "readUsers": 513904,
          "score": "7.3"
        },
        "hwBookId": "7a5d5d932b8ee9bf39b62e7b10e6c52b3",
        "readProgress": {
          "dataStatus": 1
        },
        "sdkStoreList": [
          "subscribeInfo",
          "readProgress",
          "ebookBasicInfo",
          "ebookStatisticInfo"
        ],
        "subscribeInfo": {
          "dataStatus": 1,
          "operationTime": 1684405645848,
          "subscribeStatus": 0
        }
      },
      "hwCpId": "1560",
      "hwDocId": "104156015884576905924704",
      "lpPageConfiguration": {
        "lpConfigFS": {
          "lpOpenStyle": {
            "skeletonType": 4
          },
          "preloadWeb": 1
        }
      },
      "mediaType": "180",
      "oriDocId": "158845769059247042",
      "sourceInfo": {
        "sourceId": "CP29f4145ab59567ca080bd199775434696",
        "sourceName": "鸾一"
      },
      "traceInfo": {
        "cpTrafficTraceInfo": "",
        "pipelineTraceInfo": "ebReader1560:44_1_cp1560_reader_recommend_policy1_ebook_thirdPatyReaderRecRuleId1_filterRuleReaderId1_null_null_null_null_null_null_null_null_null_null_null_null_\u0004\u0004\u0004\u0004\u000420230518102725\u0004\u0004\u0004\u0004\u00040\u0004\u0004\u0004\u0004\u0004\u0004\u00041_1560\u0004\u0004",
        "trafficTraceInfo": "{\"a\":\"01\",\"b\":\"01\",\"c\":\"01\",\"e\":\"0101999999\",\"f\":{\"f1\":\"HW_NOVEL_READER_RECOM_ZH|0|0\"},\"g\":{\"g1\":\"\",\"g2\":\"\",\"g3\":\"\",\"g4\":\"\",\"g5\":\"-1\",\"g6\":\"\",\"g7\":[],\"g8\":\"\",\"g9\":\"\"}}"
      },
      "ud": "10659764585016998739015229"
    },
    {
      "action": {
        "clickLinkList": [
          {
            "index": 0,
            "type": "0",
            "url": "https://uathwb-reader.yuewen.com/read/15884576905924704?app=hwbrowser&spm=01-01-HW_NOVEL_READER_RECOM_ZH-508-default-1-0-default&hwbid=7a5d5d932b8ee9bf39b62e7b10e6c52b&docid=104156015884576905924704&reqid=1065976458501699873901519"
          }
        ]
      },
      "cType": "ebook",
      "categoryList": [
        {
          "categoryCode": "5001060000",
          "categoryName": "都市",
          "subCategoryName": "异术超能"
        }
      ],
      "channelId": "HW_NOVEL_READER_RECOM_ZH",
      "cpCooperationMode": 2,
      "dType": "84",
      "docExtInfo": "{\"dyScenario\":\"recomm\"}",
      "docTags": "31001#5001060000:0.8|31002#TP_100354:0.7,TP_100345:0.7,TP_100516:0.7,TP_100360:0.7,TP_100447:0.7,TP_100490:0.7,TP_100426:0.7|31022#50_都市之最强仙尊奶爸/nw/0.6,50_鸾一/nr/0.4|31004#|16003#鸾一|31027#|31028#|11033#鸾一|11041#都市之最强仙尊奶爸|11074#1",
      "ebookInfo": {
        cpExtInfo: "{\"randId\":20,\"randname\":\"必读榜\"}",
        "ebookBasicInfo": {
          "author": {
            "authorName": "鸾一"
          },
          "categoryList": [
            {
              "categoryCode": "5001060000",
              "categoryName": "都市",
              "subCategoryName": "异术超能"
            }
          ],
          "cover": {
            "url": "https://lfcontentcenterdev.hwcloudtest.cn/img/pub_5/Browser_bookCoverImg_300_3/27/v3/104156015884576905924704/5afcfbdf19c94912bb9e62f8c7b70b9d_1_0/hd.webp"
          },
          "ebookLabels": "[{\"labelId\":51000014,\"labelName\":\"无敌流\"},{\"labelId\":51000003,\"labelName\":\"重生\"},{\"labelId\":51000127,\"labelName\":\"现代修真\"},{\"labelId\":51000021,\"labelName\":\"软饭流\"},{\"labelId\":51000049,\"labelName\":\"奶爸\"},{\"labelId\":51000095,\"labelName\":\"都市修仙\"},{\"labelId\":53000027,\"labelName\":\"轻松\"}]",
          "finished": 1,
          "introduction": "新书启航《开局就能无限强化》求收藏。\n五年前林凡被人活活打死，身体去到仙界，复活过来。\n经过长达九万年的时光，终成为了仙界至尊。\n十万年，林凡找到了回家的路。\n撕破空间，回到了距离自己死去的五年后。\n回来的第一件事，就是找到当初那个已有身孕，那个深爱自己，自己也深爱她的女子。\n五年的时光，她诞下一女，取名为林宝瑾。\n林凡:昕昕，我是你爸爸\n昕昕:？？？\n回归之后，没想到蓝星有系统拥有者，重生者，还有修真者。\n本书单女主。",
          "maxChapterId": "48588178101602775",
          "maxChapterIndex": 645,
          "name": "都市之最强仙尊奶爸3333",
          "wordCount": 1349620
        },
        "ebookStatisticInfo": {
          "hotValue": 5002980,
          "readUsers": 513904,
          "score": "7.3"
        },
        "hwBookId": "7a5d5d932b8ee9bf39b62e7b10e6c52b333",
        "readProgress": {
          "dataStatus": 1
        },
        "sdkStoreList": [
          "subscribeInfo",
          "readProgress",
          "ebookBasicInfo",
          "ebookStatisticInfo"
        ],
        "subscribeInfo": {
          "dataStatus": 1,
          "operationTime": 1684405645848,
          "subscribeStatus": 0
        }
      },
      "hwCpId": "1560",
      "hwDocId": "104156015884576905924704",
      "lpPageConfiguration": {
        "lpConfigFS": {
          "lpOpenStyle": {
            "skeletonType": 4
          },
          "preloadWeb": 1
        }
      },
      "mediaType": "180",
      "oriDocId": "158845769059247043",
      "sourceInfo": {
        "sourceId": "CP29f4145ab59567ca080bd199775434696",
        "sourceName": "鸾一"
      },
      "traceInfo": {
        "cpTrafficTraceInfo": "",
        "pipelineTraceInfo": "ebReader1560:44_1_cp1560_reader_recommend_policy1_ebook_thirdPatyReaderRecRuleId1_filterRuleReaderId1_null_null_null_null_null_null_null_null_null_null_null_null_\u0004\u0004\u0004\u0004\u000420230518102725\u0004\u0004\u0004\u0004\u00040\u0004\u0004\u0004\u0004\u0004\u0004\u00041_1560\u0004\u0004",
        "trafficTraceInfo": "{\"a\":\"01\",\"b\":\"01\",\"c\":\"01\",\"e\":\"0101999999\",\"f\":{\"f1\":\"HW_NOVEL_READER_RECOM_ZH|0|0\"},\"g\":{\"g1\":\"\",\"g2\":\"\",\"g3\":\"\",\"g4\":\"\",\"g5\":\"-1\",\"g6\":\"\",\"g7\":[],\"g8\":\"\",\"g9\":\"\"}}"
      },
      "ud": "10659764585016998739015229"
    },
    {
      "action": {
        "clickLinkList": [
          {
            "index": 0,
            "type": "0",
            "url": "https://uathwb-reader.yuewen.com/read/15884576905924704?app=hwbrowser&spm=01-01-HW_NOVEL_READER_RECOM_ZH-508-default-1-0-default&hwbid=7a5d5d932b8ee9bf39b62e7b10e6c52b&docid=104156015884576905924704&reqid=1065976458501699873901519"
          }
        ]
      },
      "cType": "ebook",
      "categoryList": [
        {
          "categoryCode": "5001060000",
          "categoryName": "都市",
          "subCategoryName": "异术超能"
        }
      ],
      "channelId": "HW_NOVEL_READER_RECOM_ZH",
      "cpCooperationMode": 2,
      "dType": "84",
      "docExtInfo": "{\"dyScenario\":\"recomm\"}",
      "docTags": "31001#5001060000:0.8|31002#TP_100354:0.7,TP_100345:0.7,TP_100516:0.7,TP_100360:0.7,TP_100447:0.7,TP_100490:0.7,TP_100426:0.7|31022#50_都市之最强仙尊奶爸/nw/0.6,50_鸾一/nr/0.4|31004#|16003#鸾一|31027#|31028#|11033#鸾一|11041#都市之最强仙尊奶爸|11074#1",
      "ebookInfo": {
        cpExtInfo: "{\"randId\":20,\"randname\":\"必读榜\"}",
        "ebookBasicInfo": {
          "author": {
            "authorName": "鸾一"
          },
          "categoryList": [
            {
              "categoryCode": "5001060000",
              "categoryName": "都市",
              "subCategoryName": "异术超能"
            }
          ],
          "cover": {
            "url": "https://lfcontentcenterdev.hwcloudtest.cn/img/pub_5/Browser_bookCoverImg_300_3/27/v3/104156015884576905924704/5afcfbdf19c94912bb9e62f8c7b70b9d_1_0/hd.webp"
          },
          "ebookLabels": "[{\"labelId\":51000014,\"labelName\":\"无敌流\"},{\"labelId\":51000003,\"labelName\":\"重生\"},{\"labelId\":51000127,\"labelName\":\"现代修真\"},{\"labelId\":51000021,\"labelName\":\"软饭流\"},{\"labelId\":51000049,\"labelName\":\"奶爸\"},{\"labelId\":51000095,\"labelName\":\"都市修仙\"},{\"labelId\":53000027,\"labelName\":\"轻松\"}]",
          "finished": 1,
          "introduction": "新书启航《开局就能无限强化》求收藏。\n五年前林凡被人活活打死，身体去到仙界，复活过来。\n经过长达九万年的时光，终成为了仙界至尊。\n十万年，林凡找到了回家的路。\n撕破空间，回到了距离自己死去的五年后。\n回来的第一件事，就是找到当初那个已有身孕，那个深爱自己，自己也深爱她的女子。\n五年的时光，她诞下一女，取名为林宝瑾。\n林凡:昕昕，我是你爸爸\n昕昕:？？？\n回归之后，没想到蓝星有系统拥有者，重生者，还有修真者。\n本书单女主。",
          "maxChapterId": "48588178101602775",
          "maxChapterIndex": 645,
          "name": "都市之最强仙尊奶爸44444",
          "wordCount": 1349620
        },
        "ebookStatisticInfo": {
          "hotValue": 5002980,
          "readUsers": 513904,
          "score": "7.3"
        },
        "hwBookId": "7a5d5d932b8ee9bf39b62e7b10e6c52b344",
        "readProgress": {
          "dataStatus": 1
        },
        "sdkStoreList": [
          "subscribeInfo",
          "readProgress",
          "ebookBasicInfo",
          "ebookStatisticInfo"
        ],
        "subscribeInfo": {
          "dataStatus": 1,
          "operationTime": 1684405645848,
          "subscribeStatus": 0
        }
      },
      "hwCpId": "1560",
      "hwDocId": "104156015884576905924704",
      "lpPageConfiguration": {
        "lpConfigFS": {
          "lpOpenStyle": {
            "skeletonType": 4
          },
          "preloadWeb": 1
        }
      },
      "mediaType": "180",
      "oriDocId": "158845769059247044",
      "sourceInfo": {
        "sourceId": "CP29f4145ab59567ca080bd199775434696",
        "sourceName": "鸾一"
      },
      "traceInfo": {
        "cpTrafficTraceInfo": "",
        "pipelineTraceInfo": "ebReader1560:44_1_cp1560_reader_recommend_policy1_ebook_thirdPatyReaderRecRuleId1_filterRuleReaderId1_null_null_null_null_null_null_null_null_null_null_null_null_\u0004\u0004\u0004\u0004\u000420230518102725\u0004\u0004\u0004\u0004\u00040\u0004\u0004\u0004\u0004\u0004\u0004\u00041_1560\u0004\u0004",
        "trafficTraceInfo": "{\"a\":\"01\",\"b\":\"01\",\"c\":\"01\",\"e\":\"0101999999\",\"f\":{\"f1\":\"HW_NOVEL_READER_RECOM_ZH|0|0\"},\"g\":{\"g1\":\"\",\"g2\":\"\",\"g3\":\"\",\"g4\":\"\",\"g5\":\"-1\",\"g6\":\"\",\"g7\":[],\"g8\":\"\",\"g9\":\"\"}}"
      },
      "ud": "10659764585016998739015229"
    },
    {
      "action": {
        "clickLinkList": [
          {
            "index": 0,
            "type": "0",
            "url": "https://uathwb-reader.yuewen.com/read/15884576905924704?app=hwbrowser&spm=01-01-HW_NOVEL_READER_RECOM_ZH-508-default-1-0-default&hwbid=7a5d5d932b8ee9bf39b62e7b10e6c52b&docid=104156015884576905924704&reqid=1065976458501699873901519"
          }
        ]
      },
      "cType": "ebook",
      "categoryList": [
        {
          "categoryCode": "5001060000",
          "categoryName": "都市",
          "subCategoryName": "异术超能"
        }
      ],
      "channelId": "HW_NOVEL_READER_RECOM_ZH",
      "cpCooperationMode": 2,
      "dType": "84",
      "docExtInfo": "{\"dyScenario\":\"recomm\"}",
      "docTags": "31001#5001060000:0.8|31002#TP_100354:0.7,TP_100345:0.7,TP_100516:0.7,TP_100360:0.7,TP_100447:0.7,TP_100490:0.7,TP_100426:0.7|31022#50_都市之最强仙尊奶爸/nw/0.6,50_鸾一/nr/0.4|31004#|16003#鸾一|31027#|31028#|11033#鸾一|11041#都市之最强仙尊奶爸|11074#1",
      "ebookInfo": {
        cpExtInfo: "{\"randId\":20,\"randname\":\"必读榜\"}",
        "ebookBasicInfo": {
          "author": {
            "authorName": "鸾一"
          },
          "categoryList": [
            {
              "categoryCode": "5001060000",
              "categoryName": "都市",
              "subCategoryName": "异术超能"
            }
          ],
          "cover": {
            "url": "https://lfcontentcenterdev.hwcloudtest.cn/img/pub_5/Browser_bookCoverImg_300_3/27/v3/104156015884576905924704/5afcfbdf19c94912bb9e62f8c7b70b9d_1_0/hd.webp"
          },
          "ebookLabels": "[{\"labelId\":51000014,\"labelName\":\"无敌流\"},{\"labelId\":51000003,\"labelName\":\"重生\"},{\"labelId\":51000127,\"labelName\":\"现代修真\"},{\"labelId\":51000021,\"labelName\":\"软饭流\"},{\"labelId\":51000049,\"labelName\":\"奶爸\"},{\"labelId\":51000095,\"labelName\":\"都市修仙\"},{\"labelId\":53000027,\"labelName\":\"轻松\"}]",
          "finished": 1,
          "introduction": "新书启航《开局就能无限强化》求收藏。\n五年前林凡被人活活打死，身体去到仙界，复活过来。\n经过长达九万年的时光，终成为了仙界至尊。\n十万年，林凡找到了回家的路。\n撕破空间，回到了距离自己死去的五年后。\n回来的第一件事，就是找到当初那个已有身孕，那个深爱自己，自己也深爱她的女子。\n五年的时光，她诞下一女，取名为林宝瑾。\n林凡:昕昕，我是你爸爸\n昕昕:？？？\n回归之后，没想到蓝星有系统拥有者，重生者，还有修真者。\n本书单女主。",
          "maxChapterId": "48588178101602775",
          "maxChapterIndex": 645,
          "name": "都市之最强仙尊奶爸55555",
          "wordCount": 1349620
        },
        "ebookStatisticInfo": {
          "hotValue": 5002980,
          "readUsers": 513904,
          "score": "7.3"
        },
        "hwBookId": "7a5d5d932b8ee9bf39b62e7b10e6c52b355",
        "readProgress": {
          "dataStatus": 1
        },
        "sdkStoreList": [
          "subscribeInfo",
          "readProgress",
          "ebookBasicInfo",
          "ebookStatisticInfo"
        ],
        "subscribeInfo": {
          "dataStatus": 1,
          "operationTime": 1684405645848,
          "subscribeStatus": 0
        }
      },
      "hwCpId": "1560",
      "hwDocId": "104156015884576905924704",
      "lpPageConfiguration": {
        "lpConfigFS": {
          "lpOpenStyle": {
            "skeletonType": 4
          },
          "preloadWeb": 1
        }
      },
      "mediaType": "180",
      "oriDocId": "158845769059247045",
      "sourceInfo": {
        "sourceId": "CP29f4145ab59567ca080bd199775434696",
        "sourceName": "鸾一"
      },
      "traceInfo": {
        "cpTrafficTraceInfo": "",
        "pipelineTraceInfo": "ebReader1560:44_1_cp1560_reader_recommend_policy1_ebook_thirdPatyReaderRecRuleId1_filterRuleReaderId1_null_null_null_null_null_null_null_null_null_null_null_null_\u0004\u0004\u0004\u0004\u000420230518102725\u0004\u0004\u0004\u0004\u00040\u0004\u0004\u0004\u0004\u0004\u0004\u00041_1560\u0004\u0004",
        "trafficTraceInfo": "{\"a\":\"01\",\"b\":\"01\",\"c\":\"01\",\"e\":\"0101999999\",\"f\":{\"f1\":\"HW_NOVEL_READER_RECOM_ZH|0|0\"},\"g\":{\"g1\":\"\",\"g2\":\"\",\"g3\":\"\",\"g4\":\"\",\"g5\":\"-1\",\"g6\":\"\",\"g7\":[],\"g8\":\"\",\"g9\":\"\"}}"
      },
      "ud": "10659764585016998739015229"
    },
    {
      "action": {
        "clickLinkList": [
          {
            "index": 0,
            "type": "0",
            "url": "https://uathwb-reader.yuewen.com/read/15884576905924704?app=hwbrowser&spm=01-01-HW_NOVEL_READER_RECOM_ZH-508-default-1-0-default&hwbid=7a5d5d932b8ee9bf39b62e7b10e6c52b&docid=104156015884576905924704&reqid=1065976458501699873901519"
          }
        ]
      },
      "cType": "ebook",
      "categoryList": [
        {
          "categoryCode": "5001060000",
          "categoryName": "都市",
          "subCategoryName": "异术超能"
        }
      ],
      "channelId": "HW_NOVEL_READER_RECOM_ZH",
      "cpCooperationMode": 2,
      "dType": "84",
      "docExtInfo": "{\"dyScenario\":\"recomm\"}",
      "docTags": "31001#5001060000:0.8|31002#TP_100354:0.7,TP_100345:0.7,TP_100516:0.7,TP_100360:0.7,TP_100447:0.7,TP_100490:0.7,TP_100426:0.7|31022#50_都市之最强仙尊奶爸/nw/0.6,50_鸾一/nr/0.4|31004#|16003#鸾一|31027#|31028#|11033#鸾一|11041#都市之最强仙尊奶爸|11074#1",
      "ebookInfo": {
        cpExtInfo: "{\"randId\":20,\"randname\":\"必读榜\"}",
        "ebookBasicInfo": {
          "author": {
            "authorName": "鸾一"
          },
          "categoryList": [
            {
              "categoryCode": "5001060000",
              "categoryName": "都市",
              "subCategoryName": "异术超能"
            }
          ],
          "cover": {
            "url": "https://lfcontentcenterdev.hwcloudtest.cn/img/pub_5/Browser_bookCoverImg_300_3/27/v3/104156015884576905924704/5afcfbdf19c94912bb9e62f8c7b70b9d_1_0/hd.webp"
          },
          "ebookLabels": "[{\"labelId\":51000014,\"labelName\":\"无敌流\"},{\"labelId\":51000003,\"labelName\":\"重生\"},{\"labelId\":51000127,\"labelName\":\"现代修真\"},{\"labelId\":51000021,\"labelName\":\"软饭流\"},{\"labelId\":51000049,\"labelName\":\"奶爸\"},{\"labelId\":51000095,\"labelName\":\"都市修仙\"},{\"labelId\":53000027,\"labelName\":\"轻松\"}]",
          "finished": 1,
          "introduction": "新书启航《开局就能无限强化》求收藏。\n五年前林凡被人活活打死，身体去到仙界，复活过来。\n经过长达九万年的时光，终成为了仙界至尊。\n十万年，林凡找到了回家的路。\n撕破空间，回到了距离自己死去的五年后。\n回来的第一件事，就是找到当初那个已有身孕，那个深爱自己，自己也深爱她的女子。\n五年的时光，她诞下一女，取名为林宝瑾。\n林凡:昕昕，我是你爸爸\n昕昕:？？？\n回归之后，没想到蓝星有系统拥有者，重生者，还有修真者。\n本书单女主。",
          "maxChapterId": "48588178101602775",
          "maxChapterIndex": 645,
          "name": "都市之最强仙尊奶爸55555",
          "wordCount": 1349620
        },
        "ebookStatisticInfo": {
          "hotValue": 5002980,
          "readUsers": 513904,
          "score": "7.3"
        },
        "hwBookId": "7a5d5d932b8ee9bf39b62e7b10e6c52b3551",
        "readProgress": {
          "dataStatus": 1
        },
        "sdkStoreList": [
          "subscribeInfo",
          "readProgress",
          "ebookBasicInfo",
          "ebookStatisticInfo"
        ],
        "subscribeInfo": {
          "dataStatus": 1,
          "operationTime": 1684405645848,
          "subscribeStatus": 0
        }
      },
      "hwCpId": "1560",
      "hwDocId": "104156015884576905924704",
      "lpPageConfiguration": {
        "lpConfigFS": {
          "lpOpenStyle": {
            "skeletonType": 4
          },
          "preloadWeb": 1
        }
      },
      "mediaType": "180",
      "oriDocId": "158845769059247046",
      "sourceInfo": {
        "sourceId": "CP29f4145ab59567ca080bd199775434696",
        "sourceName": "鸾一"
      },
      "traceInfo": {
        "cpTrafficTraceInfo": "",
        "pipelineTraceInfo": "ebReader1560:44_1_cp1560_reader_recommend_policy1_ebook_thirdPatyReaderRecRuleId1_filterRuleReaderId1_null_null_null_null_null_null_null_null_null_null_null_null_\u0004\u0004\u0004\u0004\u000420230518102725\u0004\u0004\u0004\u0004\u00040\u0004\u0004\u0004\u0004\u0004\u0004\u00041_1560\u0004\u0004",
        "trafficTraceInfo": "{\"a\":\"01\",\"b\":\"01\",\"c\":\"01\",\"e\":\"0101999999\",\"f\":{\"f1\":\"HW_NOVEL_READER_RECOM_ZH|0|0\"},\"g\":{\"g1\":\"\",\"g2\":\"\",\"g3\":\"\",\"g4\":\"\",\"g5\":\"-1\",\"g6\":\"\",\"g7\":[],\"g8\":\"\",\"g9\":\"\"}}"
      },
      "ud": "10659764585016998739015229"
    },
    {
      "action": {
        "clickLinkList": [
          {
            "index": 0,
            "type": "0",
            "url": "https://uathwb-reader.yuewen.com/read/15884576905924704?app=hwbrowser&spm=01-01-HW_NOVEL_READER_RECOM_ZH-508-default-1-0-default&hwbid=7a5d5d932b8ee9bf39b62e7b10e6c52b&docid=104156015884576905924704&reqid=1065976458501699873901519"
          }
        ]
      },
      "cType": "ebook",
      "categoryList": [
        {
          "categoryCode": "5001060000",
          "categoryName": "都市",
          "subCategoryName": "异术超能"
        }
      ],
      "channelId": "HW_NOVEL_READER_RECOM_ZH",
      "cpCooperationMode": 2,
      "dType": "84",
      "docExtInfo": "{\"dyScenario\":\"recomm\"}",
      "docTags": "31001#5001060000:0.8|31002#TP_100354:0.7,TP_100345:0.7,TP_100516:0.7,TP_100360:0.7,TP_100447:0.7,TP_100490:0.7,TP_100426:0.7|31022#50_都市之最强仙尊奶爸/nw/0.6,50_鸾一/nr/0.4|31004#|16003#鸾一|31027#|31028#|11033#鸾一|11041#都市之最强仙尊奶爸|11074#1",
      "ebookInfo": {
        cpExtInfo: "{\"randId\":20,\"randname\":\"必读榜\"}",
        "ebookBasicInfo": {
          "author": {
            "authorName": "鸾一"
          },
          "categoryList": [
            {
              "categoryCode": "5001060000",
              "categoryName": "都市",
              "subCategoryName": "异术超能"
            }
          ],
          "cover": {
            "url": "https://lfcontentcenterdev.hwcloudtest.cn/img/pub_5/Browser_bookCoverImg_300_3/27/v3/104156015884576905924704/5afcfbdf19c94912bb9e62f8c7b70b9d_1_0/hd.webp"
          },
          "ebookLabels": "[{\"labelId\":51000014,\"labelName\":\"无敌流\"},{\"labelId\":51000003,\"labelName\":\"重生\"},{\"labelId\":51000127,\"labelName\":\"现代修真\"},{\"labelId\":51000021,\"labelName\":\"软饭流\"},{\"labelId\":51000049,\"labelName\":\"奶爸\"},{\"labelId\":51000095,\"labelName\":\"都市修仙\"},{\"labelId\":53000027,\"labelName\":\"轻松\"}]",
          "finished": 1,
          "introduction": "新书启航《开局就能无限强化》求收藏。\n五年前林凡被人活活打死，身体去到仙界，复活过来。\n经过长达九万年的时光，终成为了仙界至尊。\n十万年，林凡找到了回家的路。\n撕破空间，回到了距离自己死去的五年后。\n回来的第一件事，就是找到当初那个已有身孕，那个深爱自己，自己也深爱她的女子。\n五年的时光，她诞下一女，取名为林宝瑾。\n林凡:昕昕，我是你爸爸\n昕昕:？？？\n回归之后，没想到蓝星有系统拥有者，重生者，还有修真者。\n本书单女主。",
          "maxChapterId": "48588178101602775",
          "maxChapterIndex": 645,
          "name": "都市之最强仙尊奶爸5555566",
          "wordCount": 1349620
        },
        "ebookStatisticInfo": {
          "hotValue": 5002980,
          "readUsers": 513904,
          "score": "7.3"
        },
        "hwBookId": "7a5d5d932b8ee9bf39b62e7b10e6c52b3552",
        "readProgress": {
          "dataStatus": 1
        },
        "sdkStoreList": [
          "subscribeInfo",
          "readProgress",
          "ebookBasicInfo",
          "ebookStatisticInfo"
        ],
        "subscribeInfo": {
          "dataStatus": 1,
          "operationTime": 1684405645848,
          "subscribeStatus": 0
        }
      },
      "hwCpId": "1560",
      "hwDocId": "104156015884576905924704",
      "lpPageConfiguration": {
        "lpConfigFS": {
          "lpOpenStyle": {
            "skeletonType": 4
          },
          "preloadWeb": 1
        }
      },
      "mediaType": "180",
      "oriDocId": "158845769059247047",
      "sourceInfo": {
        "sourceId": "CP29f4145ab59567ca080bd199775434696",
        "sourceName": "鸾一"
      },
      "traceInfo": {
        "cpTrafficTraceInfo": "",
        "pipelineTraceInfo": "ebReader1560:44_1_cp1560_reader_recommend_policy1_ebook_thirdPatyReaderRecRuleId1_filterRuleReaderId1_null_null_null_null_null_null_null_null_null_null_null_null_\u0004\u0004\u0004\u0004\u000420230518102725\u0004\u0004\u0004\u0004\u00040\u0004\u0004\u0004\u0004\u0004\u0004\u00041_1560\u0004\u0004",
        "trafficTraceInfo": "{\"a\":\"01\",\"b\":\"01\",\"c\":\"01\",\"e\":\"0101999999\",\"f\":{\"f1\":\"HW_NOVEL_READER_RECOM_ZH|0|0\"},\"g\":{\"g1\":\"\",\"g2\":\"\",\"g3\":\"\",\"g4\":\"\",\"g5\":\"-1\",\"g6\":\"\",\"g7\":[],\"g8\":\"\",\"g9\":\"\"}}"
      },
      "ud": "10659764585016998739015229"
    },
    {
      "action": {
        "clickLinkList": [
          {
            "index": 0,
            "type": "0",
            "url": "https://uathwb-reader.yuewen.com/read/15884576905924704?app=hwbrowser&spm=01-01-HW_NOVEL_READER_RECOM_ZH-508-default-1-0-default&hwbid=7a5d5d932b8ee9bf39b62e7b10e6c52b&docid=104156015884576905924704&reqid=1065976458501699873901519"
          }
        ]
      },
      "cType": "ebook",
      "categoryList": [
        {
          "categoryCode": "5001060000",
          "categoryName": "都市",
          "subCategoryName": "异术超能"
        }
      ],
      "channelId": "HW_NOVEL_READER_RECOM_ZH",
      "cpCooperationMode": 2,
      "dType": "84",
      "docExtInfo": "{\"dyScenario\":\"recomm\"}",
      "docTags": "31001#5001060000:0.8|31002#TP_100354:0.7,TP_100345:0.7,TP_100516:0.7,TP_100360:0.7,TP_100447:0.7,TP_100490:0.7,TP_100426:0.7|31022#50_都市之最强仙尊奶爸/nw/0.6,50_鸾一/nr/0.4|31004#|16003#鸾一|31027#|31028#|11033#鸾一|11041#都市之最强仙尊奶爸|11074#1",
      "ebookInfo": {
        cpExtInfo: "{\"randId\":20,\"randname\":\"必读榜\"}",
        "ebookBasicInfo": {
          "author": {
            "authorName": "鸾一"
          },
          "categoryList": [
            {
              "categoryCode": "5001060000",
              "categoryName": "都市",
              "subCategoryName": "异术超能"
            }
          ],
          "cover": {
            "url": "https://lfcontentcenterdev.hwcloudtest.cn/img/pub_5/Browser_bookCoverImg_300_3/27/v3/104156015884576905924704/5afcfbdf19c94912bb9e62f8c7b70b9d_1_0/hd.webp"
          },
          "ebookLabels": "[{\"labelId\":51000014,\"labelName\":\"无敌流\"},{\"labelId\":51000003,\"labelName\":\"重生\"},{\"labelId\":51000127,\"labelName\":\"现代修真\"},{\"labelId\":51000021,\"labelName\":\"软饭流\"},{\"labelId\":51000049,\"labelName\":\"奶爸\"},{\"labelId\":51000095,\"labelName\":\"都市修仙\"},{\"labelId\":53000027,\"labelName\":\"轻松\"}]",
          "finished": 1,
          "introduction": "新书启航《开局就能无限强化》求收藏。\n五年前林凡被人活活打死，身体去到仙界，复活过来。\n经过长达九万年的时光，终成为了仙界至尊。\n十万年，林凡找到了回家的路。\n撕破空间，回到了距离自己死去的五年后。\n回来的第一件事，就是找到当初那个已有身孕，那个深爱自己，自己也深爱她的女子。\n五年的时光，她诞下一女，取名为林宝瑾。\n林凡:昕昕，我是你爸爸\n昕昕:？？？\n回归之后，没想到蓝星有系统拥有者，重生者，还有修真者。\n本书单女主。",
          "maxChapterId": "48588178101602775",
          "maxChapterIndex": 645,
          "name": "都市之最强仙尊奶爸5555577",
          "wordCount": 1349620
        },
        "ebookStatisticInfo": {
          "hotValue": 5002980,
          "readUsers": 513904,
          "score": "7.3"
        },
        "hwBookId": "7a5d5d932b8ee9bf39b62e7b10e6c52b3553",
        "readProgress": {
          "dataStatus": 1
        },
        "sdkStoreList": [
          "subscribeInfo",
          "readProgress",
          "ebookBasicInfo",
          "ebookStatisticInfo"
        ],
        "subscribeInfo": {
          "dataStatus": 1,
          "operationTime": 1684405645848,
          "subscribeStatus": 0
        }
      },
      "hwCpId": "1560",
      "hwDocId": "104156015884576905924704",
      "lpPageConfiguration": {
        "lpConfigFS": {
          "lpOpenStyle": {
            "skeletonType": 4
          },
          "preloadWeb": 1
        }
      },
      "mediaType": "180",
      "oriDocId": "158845769059247048",
      "sourceInfo": {
        "sourceId": "CP29f4145ab59567ca080bd199775434696",
        "sourceName": "鸾一"
      },
      "traceInfo": {
        "cpTrafficTraceInfo": "",
        "pipelineTraceInfo": "ebReader1560:44_1_cp1560_reader_recommend_policy1_ebook_thirdPatyReaderRecRuleId1_filterRuleReaderId1_null_null_null_null_null_null_null_null_null_null_null_null_\u0004\u0004\u0004\u0004\u000420230518102725\u0004\u0004\u0004\u0004\u00040\u0004\u0004\u0004\u0004\u0004\u0004\u00041_1560\u0004\u0004",
        "trafficTraceInfo": "{\"a\":\"01\",\"b\":\"01\",\"c\":\"01\",\"e\":\"0101999999\",\"f\":{\"f1\":\"HW_NOVEL_READER_RECOM_ZH|0|0\"},\"g\":{\"g1\":\"\",\"g2\":\"\",\"g3\":\"\",\"g4\":\"\",\"g5\":\"-1\",\"g6\":\"\",\"g7\":[],\"g8\":\"\",\"g9\":\"\"}}"
      },
      "ud": "10659764585016998739015229"
    },
    {
      "action": {
        "clickLinkList": [
          {
            "index": 0,
            "type": "0",
            "url": "https://uathwb-reader.yuewen.com/read/15884576905924704?app=hwbrowser&spm=01-01-HW_NOVEL_READER_RECOM_ZH-508-default-1-0-default&hwbid=7a5d5d932b8ee9bf39b62e7b10e6c52b&docid=104156015884576905924704&reqid=1065976458501699873901519"
          }
        ]
      },
      "cType": "ebook",
      "categoryList": [
        {
          "categoryCode": "5001060000",
          "categoryName": "都市",
          "subCategoryName": "异术超能"
        }
      ],
      "channelId": "HW_NOVEL_READER_RECOM_ZH",
      "cpCooperationMode": 2,
      "dType": "84",
      "docExtInfo": "{\"dyScenario\":\"recomm\"}",
      "docTags": "31001#5001060000:0.8|31002#TP_100354:0.7,TP_100345:0.7,TP_100516:0.7,TP_100360:0.7,TP_100447:0.7,TP_100490:0.7,TP_100426:0.7|31022#50_都市之最强仙尊奶爸/nw/0.6,50_鸾一/nr/0.4|31004#|16003#鸾一|31027#|31028#|11033#鸾一|11041#都市之最强仙尊奶爸|11074#1",
      "ebookInfo": {
        cpExtInfo: "{\"randId\":20,\"randname\":\"必读榜\"}",
        "ebookBasicInfo": {
          "author": {
            "authorName": "鸾一"
          },
          "categoryList": [
            {
              "categoryCode": "5001060000",
              "categoryName": "都市",
              "subCategoryName": "异术超能"
            }
          ],
          "cover": {
            "url": "https://lfcontentcenterdev.hwcloudtest.cn/img/pub_5/Browser_bookCoverImg_300_3/27/v3/104156015884576905924704/5afcfbdf19c94912bb9e62f8c7b70b9d_1_0/hd.webp"
          },
          "ebookLabels": "[{\"labelId\":51000014,\"labelName\":\"无敌流\"},{\"labelId\":51000003,\"labelName\":\"重生\"},{\"labelId\":51000127,\"labelName\":\"现代修真\"},{\"labelId\":51000021,\"labelName\":\"软饭流\"},{\"labelId\":51000049,\"labelName\":\"奶爸\"},{\"labelId\":51000095,\"labelName\":\"都市修仙\"},{\"labelId\":53000027,\"labelName\":\"轻松\"}]",
          "finished": 1,
          "introduction": "新书启航《开局就能无限强化》求收藏。\n五年前林凡被人活活打死，身体去到仙界，复活过来。\n经过长达九万年的时光，终成为了仙界至尊。\n十万年，林凡找到了回家的路。\n撕破空间，回到了距离自己死去的五年后。\n回来的第一件事，就是找到当初那个已有身孕，那个深爱自己，自己也深爱她的女子。\n五年的时光，她诞下一女，取名为林宝瑾。\n林凡:昕昕，我是你爸爸\n昕昕:？？？\n回归之后，没想到蓝星有系统拥有者，重生者，还有修真者。\n本书单女主。",
          "maxChapterId": "48588178101602775",
          "maxChapterIndex": 645,
          "name": "都市之最强仙尊奶爸5555588",
          "wordCount": 1349620
        },
        "ebookStatisticInfo": {
          "hotValue": 5002980,
          "readUsers": 513904,
          "score": "7.3"
        },
        "hwBookId": "7a5d5d932b8ee9bf39b62e7b10e6c52b3554",
        "readProgress": {
          "dataStatus": 1
        },
        "sdkStoreList": [
          "subscribeInfo",
          "readProgress",
          "ebookBasicInfo",
          "ebookStatisticInfo"
        ],
        "subscribeInfo": {
          "dataStatus": 1,
          "operationTime": 1684405645848,
          "subscribeStatus": 0
        }
      },
      "hwCpId": "1560",
      "hwDocId": "104156015884576905924704",
      "lpPageConfiguration": {
        "lpConfigFS": {
          "lpOpenStyle": {
            "skeletonType": 4
          },
          "preloadWeb": 1
        }
      },
      "mediaType": "180",
      "oriDocId": "158845769059247049",
      "sourceInfo": {
        "sourceId": "CP29f4145ab59567ca080bd199775434696",
        "sourceName": "鸾一"
      },
      "traceInfo": {
        "cpTrafficTraceInfo": "",
        "pipelineTraceInfo": "ebReader1560:44_1_cp1560_reader_recommend_policy1_ebook_thirdPatyReaderRecRuleId1_filterRuleReaderId1_null_null_null_null_null_null_null_null_null_null_null_null_\u0004\u0004\u0004\u0004\u000420230518102725\u0004\u0004\u0004\u0004\u00040\u0004\u0004\u0004\u0004\u0004\u0004\u00041_1560\u0004\u0004",
        "trafficTraceInfo": "{\"a\":\"01\",\"b\":\"01\",\"c\":\"01\",\"e\":\"0101999999\",\"f\":{\"f1\":\"HW_NOVEL_READER_RECOM_ZH|0|0\"},\"g\":{\"g1\":\"\",\"g2\":\"\",\"g3\":\"\",\"g4\":\"\",\"g5\":\"-1\",\"g6\":\"\",\"g7\":[],\"g8\":\"\",\"g9\":\"\"}}"
      },
      "ud": "10659764585016998739015229"
    },
  ],
}