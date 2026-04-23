// Shared data + helpers for Audio A/B Test
// Pool-based: each session samples roundSize clips from DATA.pool.
// One participant can do many sessions; per-participant "seen" tracking in
// localStorage keeps repeat sessions from overlapping until the pool is
// exhausted (at which point it silently resets). Round concept is hidden
// from the UI — it only powers the repeat-answering behavior internally.

const APP_NAME = "Audio A/B Test";

// MusicCaps test set v4: 30 prompts deterministically sampled from
// MusicCaps test set (mc01-mc24 seed=42; mc25-mc30 seed=43 from pool minus
// first 24). See audio_new_v4/subjective_ab_v4/metadata.json.
const POOL = [
  { clipId: "mc01", title: "01", prompt: "An **acoustic piano** is playing a sad sounding composition while someone is playing a **synthesizer** lead-sound that sounds like someone crying. You can hear a lot of **white noise** in the recording. This seems to be an **amateur recording**. This song may be playing on a TV show.", promptZh: "**原聲鋼琴**演奏一首聽起來悲傷 (sad) 的樂曲，同時有人用 **synthesizer lead** 奏出類似有人在哭的聲音。錄音中有很多**白噪**。聽起來像**業餘錄音**。這首歌可能會在電視節目中播放。", files: { p7v1: "mc01_p7v1.wav", p8v1: "mc01_p8v1.wav" } },
  { clipId: "mc02", title: "02", prompt: "This song contains **digital drums** playing a groove that invites to dance along with some percussive sounds. A **bass hit** sounds is adding rhythmic and harmonic elements along with a short **synth lead** sound in the higher register. A **male voice** is shouting/singing with delay on his voice. This song may be playing in a club.", promptZh: "這首歌有**電子鼓**演奏一段令人想跟著跳舞的 groove，搭配一些打擊樂音效。**bass 打擊聲**加入節奏與和聲元素，配上高音域短促的 **synth lead**。**男聲**邊喊邊唱，人聲帶有 delay。這首歌可能會在俱樂部播放。", files: { p7v1: "mc02_p7v1.wav", p8v1: "mc02_p8v1.wav" } },
  { clipId: "mc03", title: "03", prompt: "The **low quality** recording features an in-game audio recording that features an echoing female exhale sound, shimmering **hi hats**, claps, shimmering **bells melody** and groovy **bass guitar**. In the second half of the loop, the song changes and there is a sweet **female vocal** humming a melody. It sounds exciting, happy and fun.", promptZh: "**低音質**錄音呈現遊戲內音效，包含帶迴響的女性呼氣聲、閃亮的 **hi-hat**、拍手聲、閃亮的 **bells 旋律**與 groovy 的 **bass guitar**。loop 後半曲風轉變，出現甜美 (sweet) 的**女聲**哼唱旋律。聽起來興奮 (exciting)、快樂 (happy)、有趣 (fun)。", files: { p7v1: "mc03_p7v1.wav", p8v1: "mc03_p8v1.wav" } },
  { clipId: "mc04", title: "04", prompt: "A **male singer** sings this emotional melody with a **female backup singer** singing chanting tones. The song is **slow tempo** with a **guitar** strumming gently and no other instrumentation. The song is emotional and romantic. The song is beautiful and lilting.", promptZh: "**男歌手**演唱這段情感豐富 (emotional) 的旋律，**女伴唱**以吟唱 (chanting) 音調配合。**慢速**，只有**吉他**輕柔刷奏，無其他樂器。整首情感豐富 (emotional) 且浪漫 (romantic)，優美輕快 (beautiful and lilting)。", files: { p7v1: "mc04_p7v1.wav", p8v1: "mc04_p8v1.wav" } },
  { clipId: "mc05", title: "05", prompt: "The excerpt starts off with 3 **bass drum** beats after which an **explosion** and a crumbling sound can be heard. After this, downward sliding **strings** or a similar instrument in timbre can be heard creating a sort of scary effect. In the background **wind sounds** can be heard throughout.", promptZh: "片段以 3 次 **bass drum** 敲擊開始，接著是**爆炸聲**與崩塌聲。之後出現向下滑音的**弦樂**（或音色類似的樂器），營造恐怖 (scary) 感。背景全程有**風聲**。", files: { p7v1: "mc05_p7v1.wav", p8v1: "mc05_p8v1.wav" } },
  { clipId: "mc06", title: "06", prompt: "The **Pop** song features an echoing **synth keys** melody that consists of a passionate **female vocal** singing over **punchy kick**, synth bells melody, echoing synth keys melody and shimmering hi hats. It sounds emotional and passionate.", promptZh: "這首**流行 (Pop)**歌曲以帶迴響的 **synth keys** 旋律為主，**女聲**充滿熱情地在 **punchy kick**、synth bells 旋律、帶迴響的 synth keys 與閃亮 hi-hat 之上演唱。聽起來情感豐富 (emotional) 且熱情 (passionate)。", files: { p7v1: "mc06_p7v1.wav", p8v1: "mc06_p8v1.wav" } },
  { clipId: "mc07", title: "07", prompt: "The **Trap** song features a very short snippet of hard **808 bass**, shimmering **hi hats**, **punchy snare** and **synth keys** melody after which comes the second part of the loop where there is a wide filtered stuttering down sweep sound effect. It sounds like an interlude in the middle of the song.", promptZh: "這首 **Trap** 歌曲呈現很短的片段：重 **808 bass**、閃亮 **hi-hat**、**punchy snare** 與 **synth keys** 旋律，接著 loop 後半出現一段寬頻、帶 filter、卡頓式向下掃頻 (filtered stuttering down sweep) 的音效。聽起來像歌曲中段的 interlude。", files: { p7v1: "mc07_p7v1.wav", p8v1: "mc07_p8v1.wav" } },
  { clipId: "mc08", title: "08", prompt: "This is a **cumbia** piece. There is a **female vocal** singing seductively joined by male back vocals singing in the chorus. The **trumpet** is playing the main melody joined by the piano and the bass guitar in the background. **Latin percussion** playing a cumbia beat provides the rhythmic background. The atmosphere of the piece is very playful. The ideal setting for this piece can be a latin dance course.", promptZh: "這是一首 **cumbia** 曲。**女聲**性感地 (seductively) 演唱，男聲在副歌加入和聲。**trumpet** 演奏主旋律，piano 與 bass guitar 在背景伴奏。**拉丁打擊樂**演奏 cumbia 節奏構成節奏背景。氛圍非常頑皮 (playful)。適合用在拉丁舞課程。", files: { p7v1: "mc08_p7v1.wav", p8v1: "mc08_p8v1.wav" } },
  { clipId: "mc09", title: "09", prompt: "The **low quality** recording features an **electric guitar** tuning. The recording is gated so every time the guitar string is plucked it is very **noisy**, while in-between it is a complete **silence**.", promptZh: "**低音質**錄音呈現**電吉他**調音。錄音有 gate 處理，每次撥弦時**噪音很大**，撥弦之間**完全靜默**。", files: { p7v1: "mc09_p7v1.wav", p8v1: "mc09_p8v1.wav" } },
  { clipId: "mc10", title: "10", prompt: "The song is an instrumental piece. The song is medium tempo with a steady rhythm, **groovy bass line**, **retro keyboard** tones. The song is dance-like and entertaining. The song is a **hip hop** tune and an **amateur production**.", promptZh: "這是一首純器樂曲。中速、節奏穩定、**groovy 的 bass line**、**復古 keyboard** 音色。聽起來像舞曲 (dance-like) 且有娛樂性 (entertaining)。屬於 **hip hop** 曲風，**業餘製作**。", files: { p7v1: "mc10_p7v1.wav", p8v1: "mc10_p8v1.wav" } },
  { clipId: "mc11", title: "11", prompt: "The **low quality** recording features a sustained **string melody**, tinny shimmering **bells** and addictive **piano melody**, complementing each other. At the very end of the loop there is a short snippet of flat female vocal narrating. At some point during the loop, there is a subtle unwanted **low frequency sputter**, which definitely makes this recording low quality.", promptZh: "**低音質**錄音呈現持續的**弦樂旋律**、薄而閃亮的 **bells** 與令人上癮 (addictive) 的 **piano 旋律**，彼此互補。loop 最末有一小段平板的女聲旁白。loop 中途有輕微、不欲出現的**低頻爆音 (low frequency sputter)**，確實讓這段錄音音質偏差。", files: { p7v1: "mc11_p7v1.wav", p8v1: "mc11_p8v1.wav" } },
  { clipId: "mc12", title: "12", prompt: "This is a **dubstep** piece. The rhythmic background consists of a hard-hitting **electronic drum beat**. A **high-pitched synth** is playing the main melody while a **choir** sample is played in the background for the chords. There is a high energy atmosphere in the piece. It could be played at nightclubs. This piece could also take place in DJ setlists.", promptZh: "這是一首 **dubstep** 曲。節奏背景為強勁的**電子鼓拍**。**高音 synth** 演奏主旋律，背景有 **choir** 取樣作為和聲。整首高能量 (high energy) 氛圍。適合在夜店或 DJ 歌單中播放。", files: { p7v1: "mc12_p7v1.wav", p8v1: "mc12_p8v1.wav" } },
  { clipId: "mc13", title: "13", prompt: "This is a movie music piece. The music starts playing with a film reel effect. A **strings section** with **cinematic** characteristics are playing a dramatic tune while percussive elements resembling a **timpani** and a big **cymbal** are playing accentuated hits to put emphasis on this feeling. The atmosphere is epic. There is the aura of a story about to be told in this piece. It could be used in the soundtrack of a documentary, an action or a thriller movie. It could also be used in the soundtrack of a thriller video game.", promptZh: "這是一首電影配樂。開頭有膠卷 (film reel) 效果。**弦樂組**以**電影感 (cinematic)**演奏戲劇性 (dramatic) 旋律，類似 **timpani** 與大 **cymbal** 的打擊元素重擊強調情緒。氛圍史詩 (epic)，有即將展開故事的氣息。可用在紀錄片、動作片或驚悚片 (thriller) 配樂，也適合驚悚類遊戲配樂。", files: { p7v1: "mc13_p7v1.wav", p8v1: "mc13_p8v1.wav" } },
  { clipId: "mc14", title: "14", prompt: "The song is an instrumental with a **devilish voice** laughing. The tempo is fast with a **fast paced drumming** rhythm with strong **cymbal crashes**. The song is probably an adult animated show designed to scare.", promptZh: "這是一首純器樂曲，帶有**惡魔般 (devilish) 的笑聲**。快速、**快節拍鼓擊**、搭配強烈的 **cymbal crash**。可能是為了嚇人 (scare) 的成人動畫節目用。", files: { p7v1: "mc14_p7v1.wav", p8v1: "mc14_p8v1.wav" } },
  { clipId: "mc15", title: "15", prompt: "A male guitarist plays a cool guitar like on an **electric guitar**. The song is medium tempo with a **guitar solo** with heavy **echoes** played though a guitar amplifier and no other instrumentation. The song is **bluesy** and passionate. The song is a casual blue slick played on a guitar.", promptZh: "男吉他手演奏有型的吉他，像**電吉他**那種。中速，**電吉他 solo** 加**重度 echo**，透過 guitar amp 播放，無其他樂器。整首 **bluesy** 且熱情 (passionate)，是一段隨性流暢的 blues。", files: { p7v1: "mc15_p7v1.wav", p8v1: "mc15_p8v1.wav" } },
  { clipId: "mc16", title: "16", prompt: "The song is instrumental. The tempo is **fast** with a beautifully played **hand pan** arrangement by a soloist. The song is ethereal and innocent in its beauty. The audio quality is **average**.", promptZh: "純器樂曲。**快速**，獨奏者優美演奏 **hand pan** 編排。整首空靈 (ethereal)、純真 (innocent) 的美感。**音質中等**。", files: { p7v1: "mc16_p7v1.wav", p8v1: "mc16_p8v1.wav" } },
  { clipId: "mc17", title: "17", prompt: "The **low quality** recording features a musician practicing **bassoon** scale. In the background, there is a muffled **male vocal**. The recording is **mono** and **noisy**.", promptZh: "**低音質**錄音呈現一位樂手在練 **bassoon（巴松管）**音階。背景有模糊的**男聲**。錄音為**單聲道 (mono)** 且有**雜訊**。", files: { p7v1: "mc17_p7v1.wav", p8v1: "mc17_p8v1.wav" } },
  { clipId: "mc18", title: "18", prompt: "This music is an electronic instrumental. The tempo is fast with **punchy drumming** rhythm, **keyboard harmony**, vigorous **guitar rhythm** and electronically arranged sounds like a dissonant **booming drum**, water bubbling, hissing and whistle like instrument playing harmony. The song is youthful, energetic, enthusiastic, vigorous, vivacious and youthful with a dance groove. This music is **EDM**.", promptZh: "這是電子純器樂曲。快速、**punchy 鼓節奏**、**keyboard 和聲**、有力的 (vigorous) **吉他節奏**，以及電子編排的各種聲音：刺耳的 (dissonant) **低頻鼓**、水泡聲、嘶嘶聲、口哨狀樂器演奏和聲。整首青春 (youthful)、有活力 (energetic)、熱情 (enthusiastic)、有力 (vigorous)、活潑 (vivacious) 且帶舞曲 groove。屬於 **EDM**。", files: { p7v1: "mc18_p7v1.wav", p8v1: "mc18_p8v1.wav" } },
  { clipId: "mc19", title: "19", prompt: "This song features a **harmonica** playing the main melody. This is accompanied by percussion playing a simple beat with the focus on the **snare**. The **bass** plays the root note of the chord. Due to the **low quality** of the audio, the other instruments cannot be heard. T.", promptZh: "這首歌以 **harmonica（口琴）**演奏主旋律，搭配打擊樂簡單拍子、以 **snare** 為主。**bass** 演奏和弦根音。由於**音質低**，其他樂器聽不到。", files: { p7v1: "mc19_p7v1.wav", p8v1: "mc19_p8v1.wav" } },
  { clipId: "mc20", title: "20", prompt: "**Male singers** sing this **vocal harmony**. The song is medium fast tempo with a groovy bass line, steady drumming rhythm, **piano accompaniment** and **guitar rhythm**. The song is devotional and congregational. The song is a **classic Christian praise** hit.", promptZh: "**男聲群組**演唱**人聲和聲**。中快速、groovy 的 bass line、穩定鼓節奏、**piano 伴奏**、**guitar 節奏**。整首虔誠 (devotional)、帶會眾合唱感 (congregational)。是一首經典的**基督教讚美詩** hit。", files: { p7v1: "mc20_p7v1.wav", p8v1: "mc20_p8v1.wav" } },
  { clipId: "mc21", title: "21", prompt: "We hear the bright ringing of two **metal objects** clanging against each other. This is the bright metallic sound of steel ringing. In the distance, we faintly hear a country rock song. Specifically, we hear a **country rock guitar riff** being played in the background. There is also the sound of a non-steel object being placed on a surface.", promptZh: "可聽到兩個**金屬物體**相撞的明亮叮噹聲，這是鋼鐵鳴響的明亮金屬音。遠處隱約可聽到一首 country rock 歌曲，具體來說是背景中的 **country rock 吉他 riff**。另外還有一個非金屬物體放置在平面上的聲音。", files: { p7v1: "mc21_p7v1.wav", p8v1: "mc21_p8v1.wav" } },
  { clipId: "mc22", title: "22", prompt: "A **male vocalist** sings this animated song. The tempo is medium with vocal emphasis, a bright **ukelele** harmony, groovy **bass guitar**, rhythmic **acoustic guitar** and **piano** accompaniment. The song is emphatic, passionate, jealous, emotional, sentimental and story telling. The song has an orchestral vibe.", promptZh: "**男主唱**演唱這首活潑的歌。中速、以人聲為主，明亮的 **ukulele** 和聲、groovy 的 **bass guitar**、節奏感的**原聲吉他**與 **piano** 伴奏。整首帶強調感 (emphatic)、熱情 (passionate)、忌妒 (jealous)、情感豐富 (emotional)、感傷 (sentimental) 且具敘事感。帶管絃樂 (orchestral) 氛圍。", files: { p7v1: "mc22_p7v1.wav", p8v1: "mc22_p8v1.wav" } },
  { clipId: "mc23", title: "23", prompt: "This audio contains someone playing a clean **e-guitar** melody that sounds **soothing**. This song may be playing at a little living room concert.", promptZh: "這段音檔有人演奏 clean 的**電吉他**旋律，聽起來**舒緩 (soothing)**。可能會在小型客廳音樂會中播放。", files: { p7v1: "mc23_p7v1.wav", p8v1: "mc23_p8v1.wav" } },
  { clipId: "mc24", title: "24", prompt: "This clip brings about the sensation of building up to something. It features an **arpeggiated melody** on the **piano**, and **timpani drum rolls**. The audio quality is **low**.", promptZh: "這段 clip 帶來一種逐漸堆疊至某個高點 (building up) 的感覺。包含 **piano** 的 **arpeggio（分散和弦）**旋律與 **timpani** 的 drum roll。**音質低**。", files: { p7v1: "mc24_p7v1.wav", p8v1: "mc24_p8v1.wav" } },
  { clipId: "mc25", title: "25", prompt: "Instrumental **electro** music with a half time feel in the kick and **busy drums**. The **bass** is constantly busy, with **resonant filter sweeps** for dramatic effect. There are multiple overlapping high synth melodies with big sounding reverb throughout. Perfect for a large outdoor or stadium **EDM festival**.", promptZh: "純器樂 **electro** 音樂，kick 帶 half-time 感、**鼓點密集**。**bass** 持續忙碌，搭配**共振式 filter sweep** 營造戲劇效果 (dramatic)。多層高音 synth 旋律彼此重疊，全程有大空間 reverb。完美適合大型戶外或體育場 **EDM 音樂節**。", files: { p7v1: "mc25_p7v1.wav", p8v1: "mc25_p8v1.wav" } },
  { clipId: "mc26", title: "26", prompt: "This music is instrumental, the tempo is **slow** with an **electric guitar lead** and a strong **bass guitar** accompaniment. The music is assertive and emphatic but sounds sad, melancholic, nostalgic, romantic, wistful and sentimental. This music is **Blues Harmony**.", promptZh: "這是純器樂曲，**慢速**，**電吉他主奏**、強勁的 **bass guitar** 伴奏。整首堅定 (assertive)、強調 (emphatic)，但聽起來悲傷 (sad)、憂鬱 (melancholic)、懷舊 (nostalgic)、浪漫 (romantic)、若有所思 (wistful)、感傷 (sentimental)。屬於 **Blues Harmony** 風格。", files: { p7v1: "mc26_p7v1.wav", p8v1: "mc26_p8v1.wav" } },
  { clipId: "mc27", title: "27", prompt: "This is the noise of a **fire alarm** with **rock music** faintly playing in the background. The rock music piece has a **shouting vocal**, **electric guitar** and **drums**. The fire alarm makes a very disturbing sound.", promptZh: "這是**火警警報**的聲音，背景隱約有 **rock** 音樂。那段 rock 有**喊唱人聲**、**電吉他**與**鼓**。火警警報聲非常擾人 (disturbing)。", files: { p7v1: "mc27_p7v1.wav", p8v1: "mc27_p8v1.wav" } },
  { clipId: "mc28", title: "28", prompt: "This is a **rock** music piece. The **male vocalist** is singing melodically in the **Spanish** language. The **keyboard** is playing the chords of the song while the **electric guitar** joins with the occasional fills. There is a relatively quiet bass guitar supporting them in the background. The **acoustic drums** provide a basic rock beat for the rhythm. It has an easygoing feeling. This piece could be used in a teenage drama taking place in a Spanish-speaking country.", promptZh: "這是一首**搖滾 (rock)** 歌曲。**男主唱**以**西班牙語**旋律演唱。**keyboard** 演奏和弦，**電吉他**偶爾加入 fill。背景有一把相對小聲的 bass guitar 撐住。**原聲鼓**提供基本搖滾節拍。整體輕鬆 (easygoing)。可用在西語國家背景的青少年劇集。", files: { p7v1: "mc28_p7v1.wav", p8v1: "mc28_p8v1.wav" } },
  { clipId: "mc29", title: "29", prompt: "This music is a **mellow instrumental**. The tempo is medium with a passionate **violin harmony** and a simple, sharp **piano melody** with intense **bass lines**. The overall mood of the music is deep, sad, lonely, melancholic, nostalgic and poignant and yet beautiful and pleasant.", promptZh: "這是一首**柔和 (mellow)**的純器樂曲。中速，熱情 (passionate) 的 **violin 和聲**，簡單而犀利的 **piano 旋律**，搭配濃厚 **bass line**。整體情緒深沉 (deep)、悲傷 (sad)、孤獨 (lonely)、憂鬱 (melancholic)、懷舊 (nostalgic)、心酸 (poignant)，同時美麗 (beautiful) 且愉悅 (pleasant)。", files: { p7v1: "mc29_p7v1.wav", p8v1: "mc29_p8v1.wav" } },
  { clipId: "mc30", title: "30", prompt: "This audio contains someone playing a melody on a **guitar** in the midrange while someone else is strumming a melody on a **cuatro** in a higher key. Someone is playing a **tambourine** while a **clarinet** is playing a fast lead melody. This audio may be playing as a **live concert**.", promptZh: "這段音檔有人以 **guitar** 中音域演奏旋律，另一人以 **cuatro（拉丁四弦琴）**在較高音域刷奏旋律。另有人敲 **tambourine**，**clarinet** 演奏快速主旋律。可能是**現場音樂會**。", files: { p7v1: "mc30_p7v1.wav", p8v1: "mc30_p8v1.wav" } },
];

const DATA = {
  appName: APP_NAME,
  project: "audio_ab_test_musiccaps_p7v1_vs_p8v1",
  projectLabel: "Q vs NQ",
  variants: ["p7v1", "p8v1"],
  roundSize: 10,
  pool: POOL,
  variantDescriptions: {
    "p7v1": { shortName: "Q", displayName: "Quality-embedding", en: "Consistency score added alongside caption during training.", zh: "加入了描述一致性分數" },
    "p8v1": { shortName: "no-Q", displayName: "no-Q", en: "Same architecture, consistency score removed — baseline for comparison.", zh: "相同架構，移除此信號作為基準對照" },
  },
};

const LEGACY_PROJECT_KEYS = ["subjective_p7v1_vs_p8v1", "audio_ab_test_p7v1_vs_p8v1"];

const LANG_OPTIONS = [
  { key: "en", label: "EN", ariaLabel: "Switch interface language to English" },
  { key: "zh", label: "中文", ariaLabel: "切換介面語言為繁體中文" },
];

const UI_TEXT = {
  en: {
    nav: {
      evaluate: "Evaluate",
      overview: "Overview",
      results: "Results",
    },
    common: {
      anonymous: "anonymous",
      switchParticipant: "Switch participant",
      roundBadge: "R",
    },
    welcome: {
      eyebrow: "Audio A/B Test · blind listening",
      heroName: "AudioTest",
      titleLead: "Welcome to",
      intro: (roundSize) => `You will compare ${roundSize} pairs of audio clips. Each pair has an A version and a B version. After listening, choose which one feels better in these two areas:`,
      criteria: {
        audioQuality: "Which clip sounds clearer, cleaner, and more pleasant overall?",
        promptFollowing: "Which clip matches the text prompt more closely?",
      },
      blindNotice: () => [
        "Blind test — A / B sources stay hidden",
        "When it's a toss-up, just go with your gut",
        "~6–8 min · headphones recommended",
      ],
      keepGoing: "",
      nameLabel: "Name",
      namePlaceholder: "e.g. Alice Chen",
      start: "Start test",
    },
    metrics: {
      audioQuality: {
        label: "Audio Quality",
        hint: "Does it sound clean and natural, or are there glitches and distortion?",
      },
      promptFollowing: {
        label: "Prompt Following",
        hint: "Does the music match the description written above?",
      },
    },
    runner: {
      noRound: "No questions in progress",
      restartHint: "Click the × next to your name in the top bar to restart from the welcome screen.",
      jumpToQuestion: (idx, answered) => `Jump to question ${idx}${answered ? " (rated)" : ""}`,
      slug: (round, question, total) => `${DATA.projectLabel} · Question ${question} / ${total}`,
      pairTitle: "A vs B",
      promptTag: "Prompt",
      blindSample: "Blind sample",
      play: "Play",
      pause: "Pause",
      replay: "Replay",
      previous: "Previous",
      next: "Next",
      viewResults: "View results",
      backToResults: "Back to results",
      keyboardHint: "← → to navigate",
      reviewMode: "Read-only review — ratings are locked",
      ready: "Rated · ready for next",
      partial: "Rate both dimensions to continue",
      answered: (count, total) => `${count} / ${total} answered`,
      overview: "Overview",
    },
    overview: {
      eyebrow: () => `${DATA.projectLabel} · Overview`,
      title: "Overview",
      lede: "Each card is one question. Rated cards show your AQ and PF scores. A / B identities are revealed once all questions are answered.",
      answered: "Answered",
      participantRound: "Participant",
      status: "Status",
      readyToReveal: "Ready to view results",
      notStarted: "Not started",
      inProgress: "In progress",
      notRated: "Not rated — click to open",
      allDone: "All done. You can view the results now.",
      remaining: (count) => `${count} question${count === 1 ? "" : "s"} remaining — listen through before rating.`,
      continue: "Continue rating",
      viewResults: "View results",
    },
    results: {
      eyebrow: (round, participant) => `${DATA.projectLabel} · Results · ${participant || "anonymous"}`,
      title: "Results",
      questionsRated: "Questions rated",
      tie: "Tie",
      tieCaption: "about the same",
      points: "pts",
      questionsUnit: "Qs",
      preferLeft: (label) => `prefer ${label}`,
      preferRight: (label) => `prefer ${label}`,
      table: {
        number: "#",
        question: "Question",
        aq: "AQ",
        pf: "PF",
        identity: "A / B identities",
      },
      noRound: "No questions in progress",
      abDiffTitle: "What were you evaluating?",
      abDiffIntro: "Modern text-to-music models use AI-generated captions to guide generation. The problem: for the same piece of music, AI descriptions can vary significantly each time. We tried quantifying \"how consistent the captions for a track are\" into a single score, and feeding it alongside the caption during training — to see if the model could generate music that better matches text and maintains more stable quality.",
      backToReview: "← Listen again",
      submitMessage: "Your feedback means a lot, thank you!",
      exportMessage: "Download your ratings as JSON.",
      backup: "Download results",
      downloadOnly: "Download results",
      downloadAndNext: "Download & continue",
      submit: "Submit results",
      nextRound: "Continue",
      uploading: "Uploading…",
      retry: "Retry upload",
      exportConfirm: (round, participant) => `Download results for "${participant}"?`,
      submitConfirm: (round, participant) => `Submit results for "${participant}"?`,
      exported: () => `Results exported.`,
      submitted: (round, shortId) => `Results submitted · id ${shortId}.`,
      uploadFailed: (message) => `Upload failed: ${message}. A backup JSON file was downloaded. You can retry below, or share that file with the study team.`,
      retrying: "Retrying upload…",
      retryFailed: (message) => `Retry failed: ${message}. Use the backup JSON file that was already downloaded.`,
    },
    cmos: {
      aMuchBetter: "A much better",
      aBetter: "A better",
      aSlightlyBetter: "A slightly better",
      same: "About the same",
      bSlightlyBetter: "B slightly better",
      bBetter: "B better",
      bMuchBetter: "B much better",
      leftEnd: "A much better",
      rightEnd: "B much better",
    },
  },
  zh: {
    nav: {
      evaluate: "作答",
      overview: "總覽",
      results: "結果",
    },
    common: {
      anonymous: "匿名",
      switchParticipant: "切換測試者",
      roundBadge: "第",
    },
    welcome: {
      eyebrow: "Audio A/B Test · 盲測聆聽",
      heroName: "AudioTest",
      titleLead: "歡迎使用",
      intro: (roundSize) => `你將比較 ${roundSize} 組音檔。每一組都有 A 與 B 兩個版本。聽完後，請依照下面兩個方向判斷哪一個比較好：`,
      criteria: {
        audioQuality: "哪個版本聽起來更清楚、更自然、整體更舒服？",
        promptFollowing: "哪個版本更貼近畫面上方顯示的文字描述？",
      },
      blindNotice: () => [
        "盲測 — 不顯示 A / B 真實來源",
        "差異不大時，依直覺挑一個即可",
        "預估 6~8 分鐘 · 建議戴耳機聆聽",
      ],
      keepGoing: "",
      nameLabel: "姓名",
      namePlaceholder: "例如：Alice Chen",
      start: "開始測試",
    },
    metrics: {
      audioQuality: {
        label: "音質",
        hint: "聽起來乾淨自然嗎？還是有雜音或失真？",
      },
      promptFollowing: {
        label: "Prompt 符合度",
        hint: "音樂是否符合上方的文字描述？",
      },
    },
    runner: {
      noRound: "目前沒有題目",
      restartHint: "可點選上方姓名旁的 ×，回到歡迎頁重新開始。",
      jumpToQuestion: (idx, answered) => `跳到第 ${idx} 題${answered ? "（已評分）" : ""}`,
      slug: (round, question, total) => `${DATA.projectLabel} · 第 ${question} / ${total} 題`,
      pairTitle: "A vs B",
      promptTag: "Prompt 原文",
      blindSample: "盲測樣本",
      play: "播放",
      pause: "暫停",
      replay: "重播",
      previous: "上一題",
      next: "下一題",
      viewResults: "查看結果",
      backToResults: "回到結果",
      keyboardHint: "← → 切換題目",
      reviewMode: "唯讀回顧 — 評分已提交",
      ready: "已完成，可前往下一題",
      partial: "完成兩個維度的評分後才能繼續",
      answered: (count, total) => `已完成 ${count} / ${total} 題`,
      overview: "總覽",
    },
    overview: {
      eyebrow: () => `${DATA.projectLabel} · 總覽`,
      title: "總覽",
      lede: "每張卡片代表一題。已作答的卡片會顯示 AQ 與 PF 分數；全部完成後才會揭示 A / B 真實身分。",
      answered: "已作答",
      participantRound: "測試者",
      status: "狀態",
      readyToReveal: "可查看結果",
      notStarted: "尚未開始",
      inProgress: "進行中",
      notRated: "尚未評分，點擊即可作答",
      allDone: "全部完成，可以查看結果。",
      remaining: (count) => `還有 ${count} 題未完成，請完成聆聽與評分。`,
      continue: "繼續作答",
      viewResults: "查看結果",
    },
    results: {
      eyebrow: (round, participant) => `${DATA.projectLabel} · 結果 · ${participant || "匿名"}`,
      title: "結果",
      questionsRated: "已評分題數",
      tie: "平手",
      tieCaption: "兩者相同",
      points: "分",
      questionsUnit: "題",
      preferLeft: (label) => `偏好 ${label}`,
      preferRight: (label) => `偏好 ${label}`,
      table: {
        number: "#",
        question: "題目",
        aq: "AQ",
        pf: "PF",
        identity: "A / B 真實身分",
      },
      noRound: "目前沒有題目",
      abDiffTitle: "你剛才在評估什麼？",
      abDiffIntro: "現代文字轉音樂模型使用 AI 自動生成的描述（caption）來引導生成。但問題是：同一首音樂，每次 AI 描述的方式可能差很大。我們嘗試把「這首音樂的描述之間有多一致」量化成一個數字，連同描述一起傳給模型學習 — 看能否讓模型生成更貼近文字、品質更穩定的音樂。",
      backToReview: "← 回去聽",
      submitMessage: "您的回饋很重要，謝謝！",
      exportMessage: "請下載評分結果 JSON。",
      backup: "下載結果",
      downloadOnly: "下載結果",
      downloadAndNext: "下載並繼續",
      submit: "送出結果",
      nextRound: "繼續",
      uploading: "上傳中…",
      retry: "重新上傳",
      exportConfirm: (round, participant) => `要下載 ${participant} 的評分結果嗎？`,
      submitConfirm: (round, participant) => `要送出 ${participant} 的評分結果嗎？`,
      exported: () => `評分結果已匯出。`,
      submitted: (round, shortId) => `評分結果已送出 · id ${shortId}。`,
      uploadFailed: (message) => `上傳失敗：${message}。系統已下載備份 JSON，你可以在下方重試，或把檔案交給研究團隊。`,
      retrying: "重新上傳中…",
      retryFailed: (message) => `重新上傳失敗：${message}。請使用先前下載的備份 JSON。`,
    },
    cmos: {
      aMuchBetter: "A 明顯較好",
      aBetter: "A 較好",
      aSlightlyBetter: "A 稍微較好",
      same: "差不多",
      bSlightlyBetter: "B 稍微較好",
      bBetter: "B 較好",
      bMuchBetter: "B 明顯較好",
      leftEnd: "A 明顯較好",
      rightEnd: "B 明顯較好",
    },
  },
};

function getText(lang = "en") {
  return UI_TEXT[lang] || UI_TEXT.en;
}

function detectPreferredLang() {
  if (typeof navigator !== "undefined") {
    const preferred = (navigator.language || "").toLowerCase();
    if (preferred.startsWith("zh")) return "zh";
  }
  return "en";
}

function getMetrics(lang = "en") {
  const text = getText(lang);
  return [
    { key: "audioQuality", label: text.metrics.audioQuality.label, hint: text.metrics.audioQuality.hint },
    { key: "promptFollowing", label: text.metrics.promptFollowing.label, hint: text.metrics.promptFollowing.hint },
  ];
}

// Sample k distinct pool indices, preferring clips not yet seen by this
// participant. If the unseen pool is smaller than k, quietly reset and
// sample from the full pool — caller can look at `poolReset` in the
// result if it wants to log this.
function sampleRoundIndices(pool, roundSize, excludeClipIds) {
  const exclude = new Set(excludeClipIds || []);
  const unseenIndices = pool
    .map((_, i) => i)
    .filter(i => !exclude.has(pool[i].clipId));
  const k = Math.min(roundSize, pool.length);
  let source;
  let poolReset = false;
  if (unseenIndices.length >= k) {
    source = unseenIndices.slice();
  } else {
    poolReset = true;
    source = pool.map((_, i) => i);
  }
  // Fisher-Yates
  for (let i = source.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [source[i], source[j]] = [source[j], source[i]];
  }
  return { indices: source.slice(0, k), poolReset };
}

function makeAbMap(size) {
  return Array.from({ length: size }, () => Math.random() < 0.5);
}

// Build a runtime "question" object from a pool item + A/B flip decision.
// `aIsV1` true → A is variants[0] (left / pink), B is variants[1] (right / lavender).
function buildQuestion(poolItem, posInRound, aIsV1, variants) {
  const [v1, v2] = variants;
  const f = poolItem.files;
  return {
    id: posInRound,
    title: poolItem.title,
    titleZh: poolItem.titleZh || poolItem.title,
    clipId: poolItem.clipId,
    desc: poolItem.prompt,
    descZh: poolItem.promptZh || "",
    aFile: `audio/${aIsV1 ? f[v1] : f[v2]}`,
    bFile: `audio/${aIsV1 ? f[v2] : f[v1]}`,
    aFileName: aIsV1 ? f[v1] : f[v2],
    bFileName: aIsV1 ? f[v2] : f[v1],
    aLabel: aIsV1 ? v1 : v2,
    bLabel: aIsV1 ? v2 : v1,
  };
}

// 7-point CMOS scale. Positive = A preferred, negative = B preferred, 0 = tie.
function getCmosOptions(lang = "en") {
  const text = getText(lang);
  return [
    { val:  3, side: "A",   label: text.cmos.aMuchBetter },
    { val:  2, side: "A",   label: text.cmos.aBetter },
    { val:  1, side: "A",   label: text.cmos.aSlightlyBetter },
    { val:  0, side: "tie", label: text.cmos.same },
    { val: -1, side: "B",   label: text.cmos.bSlightlyBetter },
    { val: -2, side: "B",   label: text.cmos.bBetter },
    { val: -3, side: "B",   label: text.cmos.bMuchBetter },
  ];
}

// Plain SVG icons (no emoji)
const icons = {
  play:  '<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M4 3.5v9a.5.5 0 0 0 .77.42l7-4.5a.5.5 0 0 0 0-.84l-7-4.5A.5.5 0 0 0 4 3.5Z"/></svg>',
  pause: '<svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><rect x="4" y="3" width="3.2" height="10" rx="1"/><rect x="8.8" y="3" width="3.2" height="10" rx="1"/></svg>',
  arrowL:'<svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3 5 8l5 5"/></svg>',
  arrowR:'<svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3l5 5-5 5"/></svg>',
  check: '<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8.5 6.5 12 13 4.5"/></svg>',
  grid:  '<svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2.5" y="2.5" width="4" height="4" rx="0.5"/><rect x="9.5" y="2.5" width="4" height="4" rx="0.5"/><rect x="2.5" y="9.5" width="4" height="4" rx="0.5"/><rect x="9.5" y="9.5" width="4" height="4" rx="0.5"/></svg>',
  restart:'<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 3 1 7 5 7"/><path d="M2.3 10a6 6 0 1 0 .3-3"/></svg>',
};

function boldifyHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
}

function variantLabel(key) {
  return DATA.variantDescriptions?.[key]?.shortName || key;
}

Object.assign(window, {
  DATA, POOL, LANG_OPTIONS, LEGACY_PROJECT_KEYS, icons,
  getText, getMetrics, getCmosOptions, detectPreferredLang,
  sampleRoundIndices, makeAbMap, buildQuestion, boldifyHtml, variantLabel,
});
