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
  { clipId: "mc01", title: "01", prompt: "An **acoustic piano** is playing a sad sounding composition while someone is playing a **synthesizer** lead-sound that sounds like someone crying. You can hear a lot of **white noise** in the recording. This seems to be an **amateur recording**. This song may be playing on a TV show.", promptZh: "**原聲鋼琴（acoustic piano）**演奏著一段悲傷的樂曲，同時有人用 **合成器主奏音色（synthesizer lead）** 奏出彷彿哭泣般的聲音。錄音中可聽到大量**白噪音（white noise）**。這聽起來像是**業餘錄音（amateur recording）**。這首歌可能會出現在電視節目中播放。", files: { p7v1: "mc01_p7v1.wav", p8v1: "mc01_p8v1.wav" } },
  { clipId: "mc02", title: "02", prompt: "This song contains **digital drums** playing a groove that invites to dance along with some percussive sounds. A **bass hit** sounds is adding rhythmic and harmonic elements along with a short **synth lead** sound in the higher register. A **male voice** is shouting/singing with delay on his voice. This song may be playing in a club.", promptZh: "這首歌有**電子鼓（digital drums）**演奏出令人想隨之起舞的**律動（groove）**，並搭配一些打擊樂聲。短促的高音域 **合成器主奏音色（synth lead）** 與 **低音打擊聲（bass hit）** 一起提供節奏與和聲元素。**男聲**以帶有**延遲效果（delay）**的方式吶喊式演唱（shouting/singing）。這首歌可能會在俱樂部播放。", files: { p7v1: "mc02_p7v1.wav", p8v1: "mc02_p8v1.wav" } },
  { clipId: "mc03", title: "03", prompt: "The **low quality** recording features an in-game audio recording that features an echoing female exhale sound, shimmering **hi hats**, claps, shimmering **bells melody** and groovy **bass guitar**. In the second half of the loop, the song changes and there is a sweet **female vocal** humming a melody. It sounds exciting, happy and fun.", promptZh: "這段**低音質錄音（low-quality recording）**像是遊戲內錄音，包含帶迴響的女性呼氣聲、閃亮的 **踩鈸（hi-hats）**、拍手聲、閃亮的**鐘聲旋律（bells melody）**，以及富有律動感的**低音吉他（groovy bass guitar）**。在**循環段（loop）**的後半段，歌曲發生變化，出現甜美的**女聲**哼唱旋律。整體聽起來令人興奮、快樂又有趣。", files: { p7v1: "mc03_p7v1.wav", p8v1: "mc03_p8v1.wav" } },
  { clipId: "mc04", title: "04", prompt: "A **male singer** sings this emotional melody with a **female backup singer** singing chanting tones. The song is **slow tempo** with a **guitar** strumming gently and no other instrumentation. The song is emotional and romantic. The song is beautiful and lilting.", promptZh: "**男歌手**演唱這段充滿情感的旋律，並由**女聲伴唱（female backup singer）**以吟唱式音調（chanting tones）配合。歌曲速度**緩慢（slow tempo）**，只有**吉他（guitar）**輕柔刷奏，沒有其他樂器。整體情感豐富而浪漫，也十分優美，帶有輕盈搖曳感（lilting）。", files: { p7v1: "mc04_p7v1.wav", p8v1: "mc04_p8v1.wav" } },
  { clipId: "mc05", title: "05", prompt: "The excerpt starts off with 3 **bass drum** beats after which an **explosion** and a crumbling sound can be heard. After this, downward sliding **strings** or a similar instrument in timbre can be heard creating a sort of scary effect. In the background **wind sounds** can be heard throughout.", promptZh: "這段片段一開始有 3 下 **低音大鼓（bass drum）**，接著可聽到**爆炸聲（explosion）**與坍塌聲。之後出現向下滑音的**弦樂（strings）**或音色相近的樂器，營造出有些恐怖的效果。背景中從頭到尾都能聽見**風聲（wind sounds）**。", files: { p7v1: "mc05_p7v1.wav", p8v1: "mc05_p8v1.wav" } },
  { clipId: "mc06", title: "06", prompt: "The **Pop** song features an echoing **synth keys** melody that consists of a passionate **female vocal** singing over **punchy kick**, synth bells melody, echoing synth keys melody and shimmering hi hats. It sounds emotional and passionate.", promptZh: "這首**流行歌曲（Pop song）**以帶有迴響的**合成器鍵盤（synth keys）**旋律為主，一位充滿熱情的**女聲**在有力的**底鼓（punchy kick）**、**合成器鐘聲旋律（synth bells melody）**、帶迴響的合成器鍵盤旋律與閃亮的**踩鈸（hi-hats）**之上演唱。整體聽起來情感豐富而熱烈。", files: { p7v1: "mc06_p7v1.wav", p8v1: "mc06_p8v1.wav" } },
  { clipId: "mc07", title: "07", prompt: "The **Trap** song features a very short snippet of hard **808 bass**, shimmering **hi hats**, **punchy snare** and **synth keys** melody after which comes the second part of the loop where there is a wide filtered stuttering down sweep sound effect. It sounds like an interlude in the middle of the song.", promptZh: "這首**陷阱音樂（Trap）**只出現非常短的一小段：厚重的 **808 低音（808 bass）**、閃亮的**踩鈸（hi-hats）**、有力的**軍鼓（punchy snare）**與**合成器鍵盤（synth keys）**旋律；接著在**循環段（loop）**的後半段出現一個寬廣、經過**濾波處理（filtered）**且帶有卡頓感的向下掃頻音效（stuttering down sweep）。整體聽起來像歌曲中段的**間奏（interlude）**。", files: { p7v1: "mc07_p7v1.wav", p8v1: "mc07_p8v1.wav" } },
  { clipId: "mc08", title: "08", prompt: "This is a **cumbia** piece. There is a **female vocal** singing seductively joined by male back vocals singing in the chorus. The **trumpet** is playing the main melody joined by the piano and the bass guitar in the background. **Latin percussion** playing a cumbia beat provides the rhythmic background. The atmosphere of the piece is very playful. The ideal setting for this piece can be a latin dance course.", promptZh: "這是一首 **昆比亞（cumbia）** 作品。**女聲**以帶有挑逗感的方式演唱，副歌時有男聲伴唱加入。**小號（trumpet）**演奏主旋律，背景則有**鋼琴（piano）**與**低音吉他（bass guitar）**伴奏。**拉丁打擊樂（Latin percussion）**演奏出昆比亞節奏，形成整體的節奏基底。整體氛圍非常俏皮，適合出現在拉丁舞課程中。", files: { p7v1: "mc08_p7v1.wav", p8v1: "mc08_p8v1.wav" } },
  { clipId: "mc09", title: "09", prompt: "The **low quality** recording features an **electric guitar** tuning. The recording is gated so every time the guitar string is plucked it is very **noisy**, while in-between it is a complete **silence**.", promptZh: "這段**低音質錄音（low-quality recording）**呈現的是**電吉他（electric guitar）**調音的聲音。錄音經過**門限處理（gate）**，因此每次撥弦時都會聽到很大的雜訊，而兩次撥弦之間則是完全的寂靜。", files: { p7v1: "mc09_p7v1.wav", p8v1: "mc09_p8v1.wav" } },
  { clipId: "mc10", title: "10", prompt: "The song is an instrumental piece. The song is medium tempo with a steady rhythm, **groovy bass line**, **retro keyboard** tones. The song is dance-like and entertaining. The song is a **hip hop** tune and an **amateur production**.", promptZh: "這是一首純器樂曲。歌曲為中速，節奏穩定，帶有富含律動感的**低音聲部（groovy bass line）**與**復古鍵盤音色（retro keyboard tones）**。整體聽起來有舞曲感，也頗具娛樂性。這是一首**嘻哈（hip hop）**風格的作品，而且帶有**業餘製作（amateur production）**的質感。", files: { p7v1: "mc10_p7v1.wav", p8v1: "mc10_p8v1.wav" } },
  { clipId: "mc11", title: "11", prompt: "The **low quality** recording features a sustained **string melody**, tinny shimmering **bells** and addictive **piano melody**, complementing each other. At the very end of the loop there is a short snippet of flat female vocal narrating. At some point during the loop, there is a subtle unwanted **low frequency sputter**, which definitely makes this recording low quality.", promptZh: "這段**低音質錄音（low-quality recording）**包含持續延展的**弦樂旋律（string melody）**、薄亮的**鈴聲（bells）**與令人上癮的**鋼琴旋律（piano melody）**，三者彼此互相襯托。在**循環段（loop）**最後會出現一小段平淡的女聲旁白。**循環段（loop）**進行到某個時點時，還能聽到細微但不該出現的**低頻爆裂聲（low frequency sputter）**，這也明顯拉低了錄音品質。", files: { p7v1: "mc11_p7v1.wav", p8v1: "mc11_p8v1.wav" } },
  { clipId: "mc12", title: "12", prompt: "This is a **dubstep** piece. The rhythmic background consists of a hard-hitting **electronic drum beat**. A **high-pitched synth** is playing the main melody while a **choir** sample is played in the background for the chords. There is a high energy atmosphere in the piece. It could be played at nightclubs. This piece could also take place in DJ setlists.", promptZh: "這是一首 **dubstep** 風格作品。節奏背景由強勁的**電子鼓節拍（electronic drum beat）**組成。高音的**合成器（high-pitched synth）**演奏主旋律，背景則有**合唱取樣（choir sample）**負責和聲。整體氛圍充滿高能量，適合在夜店播放，也很適合出現在 DJ 的歌單裡。", files: { p7v1: "mc12_p7v1.wav", p8v1: "mc12_p8v1.wav" } },
  { clipId: "mc13", title: "13", prompt: "This is a movie music piece. The music starts playing with a film reel effect. A **strings section** with **cinematic** characteristics are playing a dramatic tune while percussive elements resembling a **timpani** and a big **cymbal** are playing accentuated hits to put emphasis on this feeling. The atmosphere is epic. There is the aura of a story about to be told in this piece. It could be used in the soundtrack of a documentary, an action or a thriller movie. It could also be used in the soundtrack of a thriller video game.", promptZh: "這是一首電影配樂。音樂一開始帶有**膠卷效果（film reel effect）**。具備**電影感（cinematic）**的**弦樂組（strings section）**演奏出戲劇性的旋律，類似**定音鼓（timpani）**與大型**鈸（cymbal）**的打擊聲則以強烈重音加強這種情緒。整體氛圍十分史詩，彷彿有一段故事即將展開。這段音樂可用於紀錄片、動作片或驚悚片的配樂，也適合用在驚悚類電玩的配樂中。", files: { p7v1: "mc13_p7v1.wav", p8v1: "mc13_p8v1.wav" } },
  { clipId: "mc14", title: "14", prompt: "The song is an instrumental with a **devilish voice** laughing. The tempo is fast with a **fast paced drumming** rhythm with strong **cymbal crashes**. The song is probably an adult animated show designed to scare.", promptZh: "這是一首純器樂曲，伴隨著像是**惡魔般笑聲（devilish voice laughing）**的聲音。速度很快，具有快速的鼓擊節奏與強烈的**鈸聲重擊（cymbal crashes）**。這首歌很像是用在以驚嚇效果為主的成人動畫節目中。", files: { p7v1: "mc14_p7v1.wav", p8v1: "mc14_p8v1.wav" } },
  { clipId: "mc15", title: "15", prompt: "A male guitarist plays a cool guitar like on an **electric guitar**. The song is medium tempo with a **guitar solo** with heavy **echoes** played though a guitar amplifier and no other instrumentation. The song is **bluesy** and passionate. The song is a casual blue slick played on a guitar.", promptZh: "這位男吉他手彈出很酷、近似**電吉他（electric guitar）**的音色。歌曲為中速，只有一段帶有大量**回聲（echoes）**、透過**吉他音箱（guitar amplifier）**播放的**吉他獨奏（guitar solo）**，沒有其他樂器。整體帶有**藍調味（bluesy）**且充滿熱情，像是一段隨興的**藍調片段（blues）**。", files: { p7v1: "mc15_p7v1.wav", p8v1: "mc15_p8v1.wav" } },
  { clipId: "mc16", title: "16", prompt: "The song is instrumental. The tempo is **fast** with a beautifully played **hand pan** arrangement by a soloist. The song is ethereal and innocent in its beauty. The audio quality is **average**.", promptZh: "這是一首純器樂曲。速度**快速（fast）**，由獨奏者優美地演奏**手碟（hand pan）**編排。整體呈現空靈而純真的美感。**音質中等（average）**。", files: { p7v1: "mc16_p7v1.wav", p8v1: "mc16_p8v1.wav" } },
  { clipId: "mc17", title: "17", prompt: "The **low quality** recording features a musician practicing **bassoon** scale. In the background, there is a muffled **male vocal**. The recording is **mono** and **noisy**.", promptZh: "這段**低音質錄音（low-quality recording）**呈現一位樂手在練習**巴松管音階（bassoon scale）**。背景中可聽到模糊的**男聲**。錄音為**單聲道（mono）**，而且帶有雜訊。", files: { p7v1: "mc17_p7v1.wav", p8v1: "mc17_p8v1.wav" } },
  { clipId: "mc18", title: "18", prompt: "This music is an electronic instrumental. The tempo is fast with **punchy drumming** rhythm, **keyboard harmony**, vigorous **guitar rhythm** and electronically arranged sounds like a dissonant **booming drum**, water bubbling, hissing and whistle like instrument playing harmony. The song is youthful, energetic, enthusiastic, vigorous, vivacious and youthful with a dance groove. This music is **EDM**.", promptZh: "這是一首電子純器樂曲。速度很快，具有有力的鼓擊節奏（punchy drumming rhythm）、**鍵盤和聲（keyboard harmony）**、強勁的**吉他節奏（vigorous guitar rhythm）**，以及各種經過電子編排的聲音，例如不協和的**轟鳴鼓聲（dissonant booming drum）**、水泡聲、嘶嘶聲，還有像口哨般的樂器聲作為和聲（whistle-like instrument playing harmony）。整體充滿青春、活力與熱情，帶有明顯的**舞曲律動（dance groove）**。這是一首**電子舞曲（EDM）**。", files: { p7v1: "mc18_p7v1.wav", p8v1: "mc18_p8v1.wav" } },
  { clipId: "mc19", title: "19", prompt: "This song features a **harmonica** playing the main melody. This is accompanied by percussion playing a simple beat with the focus on the **snare**. The **bass** plays the root note of the chord. Due to the **low quality** of the audio, the other instruments cannot be heard. T.", promptZh: "這首歌以**口琴（harmonica）**演奏主旋律，搭配簡單的打擊樂節奏，重點放在**軍鼓（snare）**上。**低音聲部（bass）**演奏和弦的根音。由於音訊品質偏低，其他樂器幾乎聽不見。", files: { p7v1: "mc19_p7v1.wav", p8v1: "mc19_p8v1.wav" } },
  { clipId: "mc20", title: "20", prompt: "**Male singers** sing this **vocal harmony**. The song is medium fast tempo with a groovy bass line, steady drumming rhythm, **piano accompaniment** and **guitar rhythm**. The song is devotional and congregational. The song is a **classic Christian praise** hit.", promptZh: "一組**男聲**演唱這段**人聲和聲（vocal harmony）**。歌曲速度中快，包含帶有律動感的**低音聲部（groovy bass line）**、穩定的鼓節奏、**鋼琴伴奏（piano accompaniment）**與**吉他節奏（guitar rhythm）**。整體氛圍虔誠，帶有會眾合唱感，是一首經典的**基督教讚美歌曲（classic Christian praise）**熱門作品。", files: { p7v1: "mc20_p7v1.wav", p8v1: "mc20_p8v1.wav" } },
  { clipId: "mc21", title: "21", prompt: "We hear the bright ringing of two **metal objects** clanging against each other. This is the bright metallic sound of steel ringing. In the distance, we faintly hear a country rock song. Specifically, we hear a **country rock guitar riff** being played in the background. There is also the sound of a non-steel object being placed on a surface.", promptZh: "可以聽見兩個**金屬物體（metal objects）**互相碰撞，發出明亮的叮噹聲，也就是鋼鐵共鳴般的金屬響聲。遠處隱約傳來一首鄉村搖滾歌曲，具體來說，是背景中的**鄉村搖滾吉他反覆樂句（country rock guitar riff）**。另外還能聽見一個非鋼製物體被放到某個表面上的聲音。", files: { p7v1: "mc21_p7v1.wav", p8v1: "mc21_p8v1.wav" } },
  { clipId: "mc22", title: "22", prompt: "A **male vocalist** sings this animated song. The tempo is medium with vocal emphasis, a bright **ukelele** harmony, groovy **bass guitar**, rhythmic **acoustic guitar** and **piano** accompaniment. The song is emphatic, passionate, jealous, emotional, sentimental and story telling. The song has an orchestral vibe.", promptZh: "一位**男主唱**演唱這首充滿活力的歌曲。歌曲為中速，以人聲為主，搭配明亮的**烏克麗麗和聲（ukulele harmony）**、富有律動感的**低音吉他（groovy bass guitar）**、有節奏感的**原聲吉他（rhythmic acoustic guitar）**與**鋼琴伴奏（piano accompaniment）**。整體帶有強烈表達感、熱情、嫉妒、情感豐富與感傷的情緒，也具有敘事性（story telling），並帶有**管弦樂氛圍（orchestral vibe）**。", files: { p7v1: "mc22_p7v1.wav", p8v1: "mc22_p8v1.wav" } },
  { clipId: "mc23", title: "23", prompt: "This audio contains someone playing a clean **e-guitar** melody that sounds **soothing**. This song may be playing at a little living room concert.", promptZh: "這段音檔包含有人演奏帶有**乾淨音色（clean）**的**電吉他旋律（e-guitar melody）**，聽起來十分舒緩。這首歌可能會出現在一場小型客廳音樂會中。", files: { p7v1: "mc23_p7v1.wav", p8v1: "mc23_p8v1.wav" } },
  { clipId: "mc24", title: "24", prompt: "This clip brings about the sensation of building up to something. It features an **arpeggiated melody** on the **piano**, and **timpani drum rolls**. The audio quality is **low**.", promptZh: "這段片段帶有逐步堆疊、彷彿正要推向某個高點的感覺。它包含**鋼琴（piano）**上的**琶音旋律（arpeggio）**，以及**定音鼓滾奏（timpani drum rolls）**。**音質偏低（low）**。", files: { p7v1: "mc24_p7v1.wav", p8v1: "mc24_p8v1.wav" } },
  { clipId: "mc25", title: "25", prompt: "Instrumental **electro** music with a half time feel in the kick and **busy drums**. The **bass** is constantly busy, with **resonant filter sweeps** for dramatic effect. There are multiple overlapping high synth melodies with big sounding reverb throughout. Perfect for a large outdoor or stadium **EDM festival**.", promptZh: "這是一首純器樂的**電子音樂（electro）**，底鼓帶有半拍感（half-time feel），鼓組節奏繁密（busy drums）。**低音聲部（bass）**持續活躍，並透過**共振濾波掃頻（resonant filter sweeps）**製造戲劇效果。整段音樂中有多條高音**合成器旋律（high synth melodies）**彼此重疊，並帶著寬廣的**殘響（reverb）**。非常適合大型戶外或體育場的**電子舞曲音樂節（EDM festival）**。", files: { p7v1: "mc25_p7v1.wav", p8v1: "mc25_p8v1.wav" } },
  { clipId: "mc26", title: "26", prompt: "This music is instrumental, the tempo is **slow** with an **electric guitar lead** and a strong **bass guitar** accompaniment. The music is assertive and emphatic but sounds sad, melancholic, nostalgic, romantic, wistful and sentimental. This music is **Blues Harmony**.", promptZh: "這是一首純器樂曲，速度**緩慢（slow）**，以**電吉他主奏（electric guitar lead）**搭配強勁的**低音吉他伴奏（bass guitar accompaniment）**。整體雖然堅定而有力，卻也帶著悲傷、憂鬱、懷舊、浪漫、惆悵與感傷的情緒。這首音樂屬於**藍調和聲風格（Blues Harmony）**。", files: { p7v1: "mc26_p7v1.wav", p8v1: "mc26_p8v1.wav" } },
  { clipId: "mc27", title: "27", prompt: "This is the noise of a **fire alarm** with **rock music** faintly playing in the background. The rock music piece has a **shouting vocal**, **electric guitar** and **drums**. The fire alarm makes a very disturbing sound.", promptZh: "這是**火警警報器（fire alarm）**的聲音，背景隱約可聽到**搖滾樂（rock music）**。那段搖滾樂包含**吶喊式人聲（shouting vocal）**、**電吉他（electric guitar）**與**鼓（drums）**。火警警報器的聲音非常擾人。", files: { p7v1: "mc27_p7v1.wav", p8v1: "mc27_p8v1.wav" } },
  { clipId: "mc28", title: "28", prompt: "This is a **rock** music piece. The **male vocalist** is singing melodically in the **Spanish** language. The **keyboard** is playing the chords of the song while the **electric guitar** joins with the occasional fills. There is a relatively quiet bass guitar supporting them in the background. The **acoustic drums** provide a basic rock beat for the rhythm. It has an easygoing feeling. This piece could be used in a teenage drama taking place in a Spanish-speaking country.", promptZh: "這是一首**搖滾樂（rock）**作品。**男主唱**以**西班牙語（Spanish）**進行旋律性演唱。**鍵盤（keyboard）**負責彈奏和弦，**電吉他（electric guitar）**則不時加入一些**加花（fills）**。背景有一把音量相對較低的**低音吉他（bass guitar）**支撐整體。**原聲鼓（acoustic drums）**提供基本的搖滾節拍。整體感覺輕鬆自在，適合用在以西語國家為背景的青少年戲劇中。", files: { p7v1: "mc28_p7v1.wav", p8v1: "mc28_p8v1.wav" } },
  { clipId: "mc29", title: "29", prompt: "This music is a **mellow instrumental**. The tempo is medium with a passionate **violin harmony** and a simple, sharp **piano melody** with intense **bass lines**. The overall mood of the music is deep, sad, lonely, melancholic, nostalgic and poignant and yet beautiful and pleasant.", promptZh: "這是一首**柔和的純器樂曲（mellow instrumental）**。歌曲為中速，具有充滿熱情的**小提琴和聲（violin harmony）**、簡潔而鮮明的**鋼琴旋律（piano melody）**，以及強烈的**低音聲部（bass lines）**。整體情緒深沉、悲傷、孤獨、憂鬱、懷舊而令人心酸，但同時也美麗而悅耳。", files: { p7v1: "mc29_p7v1.wav", p8v1: "mc29_p8v1.wav" } },
  { clipId: "mc30", title: "30", prompt: "This audio contains someone playing a melody on a **guitar** in the midrange while someone else is strumming a melody on a **cuatro** in a higher key. Someone is playing a **tambourine** while a **clarinet** is playing a fast lead melody. This audio may be playing as a **live concert**.", promptZh: "這段音檔中，有人以中音域演奏**吉他（guitar）**旋律，另一人則在較高音域刷奏**拉丁四弦琴（cuatro）**的旋律。另有一人敲打**鈴鼓（tambourine）**，同時**單簧管（clarinet）**演奏快速的主旋律。這段音樂可能是在**現場音樂會（live concert）**中播放。", files: { p7v1: "mc30_p7v1.wav", p8v1: "mc30_p8v1.wav" } },
];

const DATA = {
  appName: APP_NAME,
  project: "audio_ab_test_musiccaps_p7v1_vs_p8v1",
  projectLabel: "Q vs NQ",
  variants: ["p7v1", "p8v1"],
  roundSize: 10,
  pool: POOL,
  variantDescriptions: {
    "p7v1": { shortName: "Q", displayName: "Quality-embedding（Q）", en: "Consistency score added alongside caption during training.", zh: "加入了描述一致性分數" },
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
