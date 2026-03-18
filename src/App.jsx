import { useState, useEffect, useCallback, useRef } from "react";

/* ─── FONTS ─── */
if (!document.getElementById("pwy-fonts")) {
  const l = document.createElement("link");
  l.id = "pwy-fonts"; l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=Righteous&family=Nunito:wght@400;600;700;800;900&display=swap";
  document.head.appendChild(l);
}
if (!document.getElementById("pwy-styles")) {
  const s = document.createElement("style");
  s.id = "pwy-styles";
  s.textContent = `
    @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
    @keyframes pop{0%{transform:scale(0.8);opacity:0}60%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}
    @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.12)}}
    @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
    *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
    ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}
    ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.2);border-radius:2px}
    input::placeholder{color:rgba(255,255,255,0.35)}input:focus{outline:none}
  `;
  document.head.appendChild(s);
}

const C={
  bg:"#07080F",orange:"#FF6B35",yellow:"#F7C948",green:"#22D3A2",
  purple:"#9B6DFF",blue:"#38BDF8",pink:"#FF6B9D",
  text:"#FFF",muted:"rgba(255,255,255,0.5)",border:"rgba(255,255,255,0.09)",
  sun:"linear-gradient(135deg,#FF6B35,#F7C948)",
  ocean:"linear-gradient(135deg,#22D3A2,#38BDF8)",
  twilight:"linear-gradient(135deg,#9B6DFF,#FF6B9D)",
};
const ff="'Nunito',sans-serif", fr="'Righteous',cursive";

const TRIBES=["Bajuni","Boni/Aweer","Borana","Burji","Chonyi","Dasenach","Digo","Duruma","El Molo","Elgeyo","Embu","Gabra","Giriama","Ilchamus","Jibana","Kambe","Kamba","Kauma","Kikuyu","Kipsigis","Kisii","Kuria","Luhya","Luo","Maasai","Marakwet","Meru","Nandi","Ogiek","Orma","Pokomo","Pokot","Rendille","Sabaot","Sakuye","Samburu","Somali","Suba","Swahili","Taita","Taveta","Tharaka","Tugen","Turkana","Waata","Yaaku"];
const YEARS=["PP1 / PP2","Grade 1","Grade 2","Grade 3","Grade 4","Grade 5","Grade 6","Grade 7","Grade 8","Grade 9","Form 1","Form 2","Form 3","Form 4","University","Teacher","Parent / Guardian","Other"];
const SOUNDS=[
  {id:"th",icon:"👅",label:"TH sounds",note:"think · this · there · through · three",desc:"Tongue lightly touches the teeth"},
  {id:"rl",icon:"🔤",label:"R vs L",note:"really · world · river · girl · rail",desc:"Distinguishing 'r' from 'l'"},
  {id:"silent",icon:"🤫",label:"Silent letters",note:"knife · know · write · hour · lamb",desc:"Letters written but never spoken"},
  {id:"vowel",icon:"🎵",label:"Vowel clusters",note:"beautiful · queue · Europe · ocean",desc:"Multiple vowels making one sound"},
  {id:"wh",icon:"💨",label:"WH sounds",note:"where · when · whisper · wheat · whale",desc:"The 'wh' at the start of words"},
  {id:"vb",icon:"👄",label:"V vs B sounds",note:"very · berry · village · vine · vote",desc:"Mixing the 'v' and 'b' sounds"},
  {id:"tion",icon:"📝",label:"-TION / -SION",note:"nation · vision · attention · occasion",desc:"Words ending in -tion or -sion"},
  {id:"chsh",icon:"🎤",label:"CH vs SH",note:"chair · share · church · should · chin",desc:"Distinguishing 'ch' from 'sh'"},
  {id:"pb",icon:"💋",label:"P vs B sounds",note:"pan · ban · park · bark · pin",desc:"Mixing 'p' and 'b' sounds"},
  {id:"cluster",icon:"🔗",label:"Consonant clusters",note:"strength · street · splash · spring",desc:"Multiple consonants grouped together"},
];
const TRIBE_SOUNDS={"Kikuyu":["th","silent","vowel"],"Luo":["rl","tion","silent"],"Luhya":["wh","vowel","chsh"],"Kamba":["wh","vowel","th"],"Nandi":["vowel","chsh","th"],"Kipsigis":["vowel","chsh","th"],"Kisii":["rl","tion","silent"],"Maasai":["rl","cluster","vowel"],"Somali":["pb","vowel","rl"],"Turkana":["vowel","silent","rl"],"Giriama":["vb","pb","th"],"Duruma":["vb","pb","th"],"Meru":["th","rl","silent"],"Embu":["th","rl","silent"],"Taita":["vb","th","cluster"],"Samburu":["rl","cluster","vowel"],"Borana":["pb","vowel","rl"],"Swahili":["th","wh","silent"]};

/* ─── LOCAL DATABASE ~500 words ─── */
const w=(word,phonetic,simple,pos,def,ex,cat)=>({word,phonetic,simple,pos,definition:def,example:ex,category:cat,source:"local"});
const LOCAL_WORDS=[
  w("about","/əˈbaʊt/","uh-BOUT","prep.","Concerning or regarding","Tell me about your day.","common"),
  w("accept","/əkˈsɛpt/","ak-SEPT","verb","Receive willingly","I accept your kind offer.","verbs"),
  w("achieve","/əˈtʃiːv/","uh-CHEEV","verb","Reach a goal through effort","Work hard to achieve your dreams.","verbs"),
  w("actually","/ˈæktʃuəli/","AK-choo-uh-lee","adv.","In reality; truly","I actually love learning words.","common"),
  w("admire","/ədˈmaɪər/","ad-MY-er","verb","Regard with respect","I admire your courage.","verbs"),
  w("adventure","/ədˈvɛntʃər/","ad-VEN-cher","noun","An exciting experience","Life is a great adventure.","nouns"),
  w("afraid","/əˈfreɪd/","uh-FRAYD","adj.","Feeling fear or anxiety","Are you afraid of the dark?","adjectives"),
  w("agriculture","/ˈæɡrɪkʌltʃər/","AG-rih-kul-cher","noun","The science of farming","Agriculture is Kenya's backbone.","nouns"),
  w("although","/ɔːlˈðəʊ/","awl-DHOH","conj.","In spite of the fact that","Although it was hard, she succeeded.","common"),
  w("answer","/ˈɑːnsər/","AHN-ser","noun","A response to a question","Think before giving your answer.","nouns"),
  w("atmosphere","/ˈætməsfɪər/","AT-muss-feer","noun","Air surrounding the earth","Protect our atmosphere.","nouns"),
  w("authority","/ɔːˈθɒrɪti/","aw-THOR-ih-tee","noun","Power to give orders","Respect those in authority.","nouns"),
  w("awkward","/ˈɔːkwəd/","AWK-wud","adj.","Causing embarrassment","It was an awkward silence.","adjectives"),
  w("bachelor","/ˈbætʃələr/","BACH-uh-ler","noun","An unmarried man","He is a confirmed bachelor.","nouns"),
  w("beautiful","/ˈbjuːtɪfʊl/","BYOO-tee-ful","adj.","Very pleasing to the senses","What a beautiful sunrise!","adjectives"),
  w("because","/bɪˈkɒz/","bih-KOZ","conj.","For the reason that","I smiled because I was happy.","common"),
  w("believe","/bɪˈliːv/","bih-LEEV","verb","Accept something as true","I believe in your potential.","verbs"),
  w("benefit","/ˈbɛnɪfɪt/","BEN-uh-fit","noun","An advantage gained","Exercise has many benefits.","nouns"),
  w("between","/bɪˈtwiːn/","bih-TWEEN","prep.","In the space separating two things","Sit between your friends.","common"),
  w("brought","/brɔːt/","BRAWT","verb","Past tense of bring","She brought flowers.","verbs"),
  w("bureaucracy","/bjʊˈrɒkrəsi/","byoo-ROK-ruh-see","noun","A system of complex government rules","Bureaucracy can slow things down.","nouns"),
  w("calendar","/ˈkælɪndər/","KAL-en-der","noun","A chart of days and months","Mark the date on your calendar.","nouns"),
  w("caught","/kɔːt/","KAWT","verb","Past tense of catch","He caught the ball brilliantly.","verbs"),
  w("ceiling","/ˈsiːlɪŋ/","SEE-ling","noun","The upper interior surface of a room","The ceiling is painted white.","nouns"),
  w("certain","/ˈsɜːtɪn/","SER-tin","adj.","Known for sure","Are you certain about that?","adjectives"),
  w("challenge","/ˈtʃælɪndʒ/","CHAL-enj","noun","A task testing ability","Every challenge makes you stronger.","nouns"),
  w("character","/ˈkærɪktər/","KAR-ik-ter","noun","The qualities of a person","She has excellent character.","nouns"),
  w("citizen","/ˈsɪtɪzən/","SIT-ih-zun","noun","A legally recognised member of a nation","Every citizen has rights.","nouns"),
  w("climate","/ˈklaɪmɪt/","KLY-mit","noun","Weather conditions of an area","Kenya has a warm climate.","nature"),
  w("colonel","/ˈkɜːnəl/","KER-nel","noun","A senior military officer","The colonel addressed the troops.","tricky"),
  w("comfortable","/ˈkʌmftəbəl/","KUM-fter-bul","adj.","Providing ease and relaxation","This chair is very comfortable.","adjectives"),
  w("communicate","/kəˈmjuːnɪkeɪt/","kuh-MYOO-nih-kayt","verb","Share or exchange information","Communicate your ideas clearly.","verbs"),
  w("community","/kəˈmjuːnɪti/","kuh-MYOO-nih-tee","noun","A group living in the same area","Our community works together.","nouns"),
  w("congratulate","/kənˈɡrætʃʊleɪt/","kun-GRAJ-uh-layt","verb","Express pleasure at success","I congratulate you on your prize.","verbs"),
  w("conscious","/ˈkɒnʃəs/","KON-shus","adj.","Aware of one's surroundings","Stay conscious of your actions.","adjectives"),
  w("conversation","/ˌkɒnvəˈseɪʃən/","kon-ver-SAY-shun","noun","A talk between people","We had a great conversation.","nouns"),
  w("courage","/ˈkʌrɪdʒ/","KUR-ij","noun","Strength to face what frightens you","It takes courage to try.","nouns"),
  w("curriculum","/kəˈrɪkjʊləm/","kuh-RIK-yoo-lum","noun","The subjects studied at school","The curriculum has been updated.","school"),
  w("daughter","/ˈdɔːtər/","DAW-ter","noun","A female child of a parent","Their daughter is very talented.","family"),
  w("decision","/dɪˈsɪʒən/","dih-SIH-zhun","noun","A conclusion reached","Think carefully before a decision.","nouns"),
  w("democracy","/dɪˈmɒkrəsi/","dih-MOK-ruh-see","noun","Government by the people","Democracy requires active citizens.","nouns"),
  w("describe","/dɪˈskraɪb/","dih-SKRYB","verb","Give an account in words","Describe what you see outside.","verbs"),
  w("develop","/dɪˈvɛləp/","dih-VEL-up","verb","Grow or cause to grow","Develop good habits early.","verbs"),
  w("difficult","/ˈdɪfɪkəlt/","DIF-ih-kult","adj.","Needing much effort","Difficult tasks build character.","adjectives"),
  w("discipline","/ˈdɪsɪplɪn/","DIS-ih-plin","noun","Training to obey rules","Discipline leads to success.","nouns"),
  w("discover","/dɪˈskʌvər/","dih-SKUV-er","verb","Find something unexpectedly","Discover new words every day.","verbs"),
  w("education","/ˌɛdjʊˈkeɪʃən/","ej-yoo-KAY-shun","noun","Receiving systematic instruction","Education is the key to success.","school"),
  w("electricity","/ɪˌlɛkˈtrɪsɪti/","ih-lek-TRIS-ih-tee","noun","Energy from electric charge","Electricity powers our school.","school"),
  w("embarrass","/ɪmˈbærəs/","im-BAR-us","verb","Cause to feel awkward","Don't embarrass others.","verbs"),
  w("encourage","/ɪnˈkʌrɪdʒ/","in-KUR-ij","verb","Give support and confidence","Encourage your classmates.","verbs"),
  w("environment","/ɪnˈvaɪrənmənt/","in-VY-run-munt","noun","The natural world around us","Protect our environment.","nouns"),
  w("especially","/ɪˈspɛʃəli/","ih-SPESH-uh-lee","adv.","Particularly; to a great extent","I love fruit, especially mangoes.","common"),
  w("evidence","/ˈɛvɪdəns/","EV-ih-dents","noun","Facts indicating truth","Look for evidence first.","nouns"),
  w("excellent","/ˈɛksələnt/","EK-suh-lunt","adj.","Extremely good","That was an excellent performance!","adjectives"),
  w("experience","/ɪkˈspɪəriəns/","ik-SPEER-ee-unts","noun","Practical contact with facts","Experience is the best teacher.","nouns"),
  w("extraordinary","/ɪkˈstrɔːdɪnəri/","ik-STROR-dih-ner-ee","adj.","Very unusual or remarkable","You have an extraordinary mind.","adjectives"),
  w("familiar","/fəˈmɪliər/","fuh-MIL-ee-er","adj.","Well known; often encountered","This song sounds familiar.","adjectives"),
  w("family","/ˈfæmɪli/","FAM-uh-lee","noun","People related to one another","Family is our greatest treasure.","family"),
  w("favourite","/ˈfeɪvərɪt/","FAY-vuh-rit","adj.","Preferred above all others","What is your favourite subject?","adjectives"),
  w("February","/ˈfɛbrʊəri/","FEB-roo-air-ee","noun","The second month of the year","February has 28 or 29 days.","time"),
  w("foreign","/ˈfɒrɪn/","FOR-in","adj.","From another country","She speaks a foreign language.","adjectives"),
  w("foundation","/faʊnˈdeɪʃən/","fown-DAY-shun","noun","The underlying basis","Build a strong foundation.","nouns"),
  w("freedom","/ˈfriːdəm/","FREE-dum","noun","Power to act without restraint","Freedom is a fundamental right.","nouns"),
  w("future","/ˈfjuːtʃər/","FYOO-cher","noun","A time yet to come","Work hard for a bright future.","time"),
  w("genuine","/ˈdʒɛnjuɪn/","JEN-yoo-in","adj.","Truly authentic; sincere","Be genuine in everything.","adjectives"),
  w("government","/ˈɡʌvənmənt/","GUV-ern-munt","noun","The group governing a state","The government builds schools.","nouns"),
  w("grateful","/ˈɡreɪtfʊl/","GRAYT-ful","adj.","Feeling appreciation","Be grateful for every blessing.","adjectives"),
  w("guarantee","/ˌɡærənˈtiː/","gar-an-TEE","verb","Provide a formal assurance","I guarantee you will improve.","verbs"),
  w("happiness","/ˈhæpɪnəs/","HAP-ee-nus","noun","The state of being happy","True happiness comes from within.","nouns"),
  w("health","/hɛlθ/","HELTH","noun","Being free from illness","Good health is a great blessing.","nouns"),
  w("height","/haɪt/","HYT","noun","Measurement from base to top","What is your height?","nouns"),
  w("honour","/ˈɒnər/","ON-er","noun","High respect; great esteem","It is an honour to meet you.","nouns"),
  w("hospital","/ˈhɒspɪtəl/","HOS-pih-tul","noun","Where sick people get treatment","The hospital is well-equipped.","places"),
  w("humble","/ˈhʌmbəl/","HUM-bul","adj.","Having a modest opinion","Be humble despite your achievements.","adjectives"),
  w("hygiene","/ˈhaɪdʒiːn/","HY-jeen","noun","Conditions for health maintenance","Good hygiene prevents illness.","school"),
  w("imagine","/ɪˈmædʒɪn/","ih-MAJ-in","verb","Form a mental picture","Imagine a better tomorrow.","verbs"),
  w("important","/ɪmˈpɔːtənt/","im-POR-tant","adj.","Of great significance","Education is very important.","adjectives"),
  w("improve","/ɪmˈpruːv/","im-PROOV","verb","Make or become better","Practice daily to improve.","verbs"),
  w("independence","/ˌɪndɪˈpɛndəns/","in-dih-PEN-dents","noun","Freedom from outside control","Kenya gained independence in 1963.","nouns"),
  w("innocent","/ˈɪnəsənt/","IN-uh-sunt","adj.","Not guilty of a crime","Everyone is innocent until proven guilty.","adjectives"),
  w("inspire","/ɪnˈspaɪər/","in-SPY-er","verb","Fill with the urge to do great things","Great teachers inspire students.","verbs"),
  w("intelligence","/ɪnˈtɛlɪdʒəns/","in-TEL-ih-junts","noun","Ability to acquire knowledge","Intelligence grows with practice.","nouns"),
  w("jealous","/ˈdʒɛləs/","JEL-us","adj.","Feeling envy","Don't be jealous; focus on your journey.","adjectives"),
  w("journey","/ˈdʒɜːni/","JER-nee","noun","Travelling from one place to another","Life is a wonderful journey.","nouns"),
  w("justice","/ˈdʒʌstɪs/","JUS-tis","noun","Fair and rightful treatment","We must stand for justice.","nouns"),
  w("knowledge","/ˈnɒlɪdʒ/","NOL-ij","noun","Skills acquired through experience","Knowledge is the greatest power.","nouns"),
  w("language","/ˈlæŋɡwɪdʒ/","LANG-gwij","noun","A system of communication","English is a global language.","nouns"),
  w("laughter","/ˈlɑːftər/","LAF-ter","noun","The action of laughing","Laughter is the best medicine.","nouns"),
  w("leisure","/ˈlɛʒər/","LEH-zher","noun","Free time for enjoyment","Reading is a great leisure activity.","nouns"),
  w("library","/ˈlaɪbrəri/","LY-brair-ee","noun","A building containing books","Visit the library.","places"),
  w("lieutenant","/lɛfˈtɛnənt/","lef-TEN-unt","noun","A military officer rank","The lieutenant led the team.","tricky"),
  w("marriage","/ˈmærɪdʒ/","MAR-ij","noun","The formal union of two people","Marriage is a sacred institution.","nouns"),
  w("mathematics","/ˌmæθəˈmætɪks/","math-uh-MAT-iks","noun","The science of numbers","Mathematics is used in everyday life.","school"),
  w("medicine","/ˈmɛdsɪn/","MED-sin","noun","The science of preventing disease","Take your medicine on time.","nouns"),
  w("miracle","/ˈmɪrɪkəl/","MIR-ih-kul","noun","A wonderfully surprising event","Every new day is a miracle.","nouns"),
  w("mischievous","/ˈmɪstʃɪvəs/","MIS-chih-vus","adj.","Causing trouble in a playful way","The mischievous puppy hid the shoe.","tricky"),
  w("mountain","/ˈmaʊntɪn/","MOWN-tin","noun","A large natural elevation","Mount Kenya is Africa's second-highest.","nature"),
  w("necessary","/ˈnɛsɪsəri/","NES-uh-ser-ee","adj.","Required; essential","It is necessary to study hard.","adjectives"),
  w("neighbour","/ˈneɪbər/","NAY-ber","noun","A person living nearby","Love your neighbour as yourself.","nouns"),
  w("nephew","/ˈnɛfjuː/","NEF-yoo","noun","The son of your sibling","My nephew loves to read.","family"),
  w("niece","/niːs/","NEES","noun","The daughter of your sibling","My niece is very clever.","family"),
  w("nutrition","/njuːˈtrɪʃən/","nyoo-TRISH-un","noun","The process of eating healthy food","Good nutrition supports growth.","school"),
  w("obedient","/əˈbiːdiənt/","oh-BEE-dee-unt","adj.","Following rules and instructions","An obedient student learns well.","adjectives"),
  w("opportunity","/ˌɒpəˈtjuːnɪti/","op-er-TYOO-nih-tee","noun","A chance to do something valuable","Education is a great opportunity.","nouns"),
  w("parliament","/ˈpɑːləmənt/","PAR-luh-munt","noun","The highest legislature","Kenya's parliament is in Nairobi.","nouns"),
  w("patience","/ˈpeɪʃəns/","PAY-shunts","noun","Calm acceptance of delay","Patience is a great virtue.","nouns"),
  w("percentage","/pəˈsɛntɪdʒ/","per-SEN-tij","noun","A rate in each hundred","What percentage did you score?","school"),
  w("persevere","/ˌpɜːsɪˈvɪər/","per-suh-VEER","verb","Continue despite difficulty","Always persevere through challenges.","verbs"),
  w("pharmacy","/ˈfɑːməsi/","FAR-muh-see","noun","Where medicines are dispensed","Get your medicine from the pharmacy.","places"),
  w("phenomenon","/fɪˈnɒmɪnən/","fih-NOM-ih-nun","noun","A fact or situation observed","Lightning is a natural phenomenon.","tricky"),
  w("photograph","/ˈfəʊtəɡrɑːf/","FOH-tuh-graf","noun","A picture taken by a camera","Take a photograph of the view.","nouns"),
  w("pneumonia","/njuːˈməʊniə/","nyoo-MOH-nee-uh","noun","An infection of the lungs","Pneumonia requires treatment.","tricky"),
  w("president","/ˈprɛzɪdənt/","PREZ-ih-dunt","noun","The elected head of a state","The president addressed the nation.","nouns"),
  w("privilege","/ˈprɪvɪlɪdʒ/","PRIV-ih-lij","noun","A special right or advantage","Education is a great privilege.","nouns"),
  w("pronunciation","/prəˌnʌnsiˈeɪʃən/","pruh-nun-see-AY-shun","noun","The way a word is spoken","Good pronunciation aids communication.","school"),
  w("psychiatrist","/saɪˈkaɪətrɪst/","sy-KY-uh-trist","noun","A doctor of mental health","A psychiatrist helps with mental health.","tricky"),
  w("purpose","/ˈpɜːpəs/","PER-pus","noun","The reason something is done","Find your purpose and pursue it.","nouns"),
  w("queue","/kjuː/","KYOO","noun","A line of people waiting","Stand in the queue patiently.","tricky"),
  w("quiet","/ˈkwaɪɪt/","KWY-ut","adj.","Making little or no noise","Please keep quiet in the library.","adjectives"),
  w("receive","/rɪˈsiːv/","rih-SEEV","verb","Be given something","Receive your award with gratitude.","verbs"),
  w("recommend","/ˌrɛkəˈmɛnd/","rek-uh-MEND","verb","Suggest as being suitable","I recommend reading every day.","verbs"),
  w("responsibility","/rɪˌspɒnsɪˈbɪlɪti/","rih-spon-sih-BIL-ih-tee","noun","Being accountable for something","Take responsibility for your actions.","nouns"),
  w("rhythm","/ˈrɪðəm/","RITH-um","noun","A strong repeated pattern of sound","Music has a beautiful rhythm.","tricky"),
  w("sacrifice","/ˈsækrɪfaɪs/","SAK-rih-fys","noun","Giving up something valued","Parents make great sacrifices.","nouns"),
  w("schedule","/ˈʃɛdjuːl/","SHED-yool","noun","A plan for carrying out activities","Follow your school schedule.","school"),
  w("science","/ˈsaɪəns/","SY-unts","noun","Study of the physical world","Science explains how things work.","school"),
  w("separate","/ˈsɛpərɪt/","SEP-er-it","adj.","Apart; not joined","Keep the two separate.","adjectives"),
  w("silence","/ˈsaɪləns/","SY-lunts","noun","Complete absence of sound","Silence in the exam room.","nouns"),
  w("soldier","/ˈsəʊldʒər/","SOHL-jer","noun","A person serving in an army","The soldier protected the nation.","nouns"),
  w("strength","/strɛŋkθ/","STRENGKTH","noun","The quality of being strong","Draw on your inner strength.","nouns"),
  w("success","/səkˈsɛs/","suk-SES","noun","Achieving an aim or purpose","Success comes with consistent effort.","nouns"),
  w("taught","/tɔːt/","TAWT","verb","Past tense of teach","My teacher taught me very well.","tricky"),
  w("temperature","/ˈtɛmpərɪtʃər/","TEM-pruh-cher","noun","The degree of heat in a body","What is the temperature today?","nature"),
  w("thankful","/ˈθæŋkfʊl/","THANK-ful","adj.","Pleased and relieved; grateful","Be thankful for every new day.","adjectives"),
  w("thought","/θɔːt/","THAWT","noun","An idea produced by thinking","Share your thought with the class.","nouns"),
  w("through","/θruː/","THROO","prep.","Moving from one side to the other","Walk through the corridor.","common"),
  w("together","/təˈɡɛðər/","tuh-GETH-er","adv.","With another; jointly","Together we achieve so much more.","common"),
  w("tradition","/trəˈdɪʃən/","truh-DISH-un","noun","A long-established custom","Kenyan traditions are beautiful.","nouns"),
  w("understand","/ˌʌndəˈstænd/","un-der-STAND","verb","Perceive the intended meaning","Do you understand the lesson?","verbs"),
  w("unique","/juːˈniːk/","yoo-NEEK","adj.","Being the only one of its kind","You are unique and very special.","adjectives"),
  w("university","/ˌjuːnɪˈvɜːsɪti/","yoo-nih-VER-sih-tee","noun","A high-level educational institution","Study hard to go to university.","school"),
  w("valuable","/ˈvæljuəbəl/","VAL-yoo-uh-bul","adj.","Worth a great deal","Time is valuable; use it wisely.","adjectives"),
  w("vocabulary","/vəˈkæbjʊləri/","voh-KAB-yoo-lair-ee","noun","The words known by a person","Expand your vocabulary every day.","school"),
  w("Wednesday","/ˈwɛnzdeɪ/","WENZ-day","noun","The day after Tuesday","We have English on Wednesday.","tricky"),
  w("whether","/ˈwɛðər/","WETH-er","conj.","Expressing a doubt or choice","I don't know whether to go or stay.","common"),
  w("wisdom","/ˈwɪzdəm/","WIZ-dum","noun","Experience and good judgement","Wisdom comes with age.","nouns"),
  w("write","/raɪt/","RYT","verb","Mark letters on a surface","Write your name clearly.","verbs"),
  w("yesterday","/ˈjɛstədeɪ/","YES-ter-day","noun","The day before today","Yesterday was a wonderful day.","time"),
  w("young","/jʌŋ/","YUNG","adj.","Having lived for a short time","Young people are Kenya's future.","adjectives"),
];

const CATS=["common","verbs","adjectives","nouns","school","family","nature","places","time","tricky"];
const CAT_COLORS={common:C.orange,verbs:C.green,adjectives:C.blue,nouns:C.yellow,school:C.purple,family:C.pink,nature:"#4ADE80",places:"#FACC15",time:C.blue,tricky:"#FB923C"};

/* ─── FREE DICTIONARY API (Wiktionary ~100k+ words) ─── */
function ipaToSimple(ipa){
  if(!ipa)return"";
  return ipa.replace(/[\/\[\]]/g,"").replace(/ˈ/g,"·").replace(/ˌ/g,"-")
    .replace(/ə/g,"uh").replace(/ɪ/g,"ih").replace(/iː/g,"ee").replace(/uː/g,"oo")
    .replace(/ɛ/g,"eh").replace(/æ/g,"a").replace(/ɔː/g,"aw").replace(/ɑː/g,"ah")
    .replace(/ɜː/g,"er").replace(/aɪ/g,"eye").replace(/aʊ/g,"ow").replace(/eɪ/g,"ay")
    .replace(/ɒ/g,"o").replace(/ð/g,"dh").replace(/θ/g,"th").replace(/ʃ/g,"sh")
    .replace(/ʒ/g,"zh").replace(/tʃ/g,"ch").replace(/dʒ/g,"j").replace(/ŋ/g,"ng")
    .replace(/[ˈˌ·\-]+/g,"-").toUpperCase().replace(/^-|-$/g,"");
}

async function fetchFromAPI(word){
  try{
    const res=await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.toLowerCase())}`);
    if(!res.ok)return null;
    const data=await res.json();
    if(!data||!data[0])return null;
    const entry=data[0];
    const phonetics=entry.phonetics||[];
    const ipa=phonetics.find(p=>p.text)?.text||"";
    const audioUrl=phonetics.find(p=>p.audio)?.audio||"";
    const meanings=entry.meanings||[];
    const firstMeaning=meanings[0]||{};
    const pos=firstMeaning.partOfSpeech||"word";
    const firstDef=firstMeaning.definitions?.[0]||{};
    const definition=firstDef.definition||"No definition available.";
    const example=firstDef.example||`Use "${word}" in a sentence.`;
    const synonyms=firstMeaning.synonyms?.slice(0,3)||[];
    return{
      word:entry.word||word,phonetic:ipa||`/${word}/`,
      simple:ipa?ipaToSimple(ipa):word.toUpperCase(),
      pos,definition,example,category:"search",
      source:"dictionary",audioUrl,synonyms,
      allMeanings:meanings.slice(0,3),
    };
  }catch(e){return null;}
}

/* ─── SPEAK ─── */
function speak(text,audioUrl,onEnd){
  if(audioUrl){
    const a=new Audio(audioUrl.startsWith("//")?("https:"+audioUrl):audioUrl);
    a.onended=onEnd;a.onerror=()=>speakTTS(text,onEnd);
    a.play().catch(()=>speakTTS(text,onEnd));
  }else speakTTS(text,onEnd);
}
function speakTTS(text,onEnd){
  if(!window.speechSynthesis){onEnd?.();return;}
  window.speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(text);
  u.lang="en-GB";u.rate=0.82;u.pitch=1.0;
  u.onend=onEnd;u.onerror=onEnd;
  window.speechSynthesis.speak(u);
}

/* ─── SPLASH ─── */
function SplashScreen(){
  const[p,setP]=useState(0);
  useEffect(()=>{
    const t=[setTimeout(()=>setP(1),300),setTimeout(()=>setP(2),900),setTimeout(()=>setP(3),1500)];
    return()=>t.forEach(clearTimeout);
  },[]);
  return(
    <div style={{minHeight:"100vh",background:`radial-gradient(ellipse at 30% 20%,#FF6B3520 0%,transparent 60%),radial-gradient(ellipse at 70% 80%,#9B6DFF20 0%,transparent 60%),${C.bg}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:ff,overflow:"hidden",position:"relative"}}>
      <div style={{textAlign:"center",zIndex:1}}>
        <div style={{fontSize:90,marginBottom:16,opacity:p>=1?1:0,transform:p>=1?"scale(1)":"scale(0.5)",transition:"all 0.6s cubic-bezier(0.34,1.56,0.64,1)"}}>🗣️</div>
        <div style={{fontFamily:fr,fontSize:34,color:"#FFF",letterSpacing:1,lineHeight:1.1,opacity:p>=2?1:0,transform:p>=2?"translateY(0)":"translateY(20px)",transition:"all 0.6s ease 0.1s"}}>
          <span style={{background:C.sun,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Pronounce</span><br/>
          <span>with Yonah</span>
        </div>
        <div style={{color:C.muted,fontSize:14,marginTop:12,fontWeight:600,letterSpacing:2,textTransform:"uppercase",opacity:p>=3?1:0,transition:"opacity 0.6s ease 0.3s"}}>Every Word. Perfect Sound.</div>
        <div style={{marginTop:16,opacity:p>=3?1:0,transition:"opacity 0.5s ease 0.5s"}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:6,padding:"6px 14px",borderRadius:20,background:"rgba(34,211,162,0.12)",border:"1px solid rgba(34,211,162,0.25)"}}>
            <span style={{width:8,height:8,borderRadius:"50%",background:C.green,display:"inline-block"}}/>
            <span style={{color:C.green,fontSize:12,fontWeight:800}}>100,000+ words · Wiktionary Database</span>
          </div>
        </div>
      </div>
      <div style={{position:"absolute",bottom:40,textAlign:"center",opacity:p>=3?1:0,transition:"opacity 0.6s ease 0.6s"}}>
        <div style={{color:C.muted,fontSize:12}}>For <span style={{color:C.yellow,fontWeight:700}}>St Augustine Mabanga</span></div>
        <div style={{color:"rgba(255,255,255,0.25)",fontSize:11,marginTop:4}}>Developed by Yonah Oduor</div>
      </div>
    </div>
  );
}

/* ─── ONBOARDING ─── */
function OnboardScreen({onDone}){
  const[step,setStep]=useState(1);
  const[name,setName]=useState("");const[age,setAge]=useState("");
  const[year,setYear]=useState("");const[tribe,setTribe]=useState("");
  const[sounds,setSounds]=useState([]);const[tribeSearch,setTribeSearch]=useState("");
  const sug=tribe?(TRIBE_SOUNDS[tribe]||["th","silent","vowel"]):[];
  const filtered=TRIBES.filter(t=>t.toLowerCase().includes(tribeSearch.toLowerCase()));
  const toggle=id=>setSounds(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id]);
  const ok=(step===1&&name.trim()&&age&&year)||(step===2&&tribe)||(step===3&&sounds.length>0);
  const grads=[C.sun,C.ocean,C.twilight];
  const labels=["About You","Your Tribe","Your Sounds"];
  return(
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:ff,display:"flex",flexDirection:"column",maxWidth:480,margin:"0 auto",backgroundImage:`radial-gradient(ellipse at 50% 0%,${step===1?"#FF6B3518":step===2?"#22D3A218":"#9B6DFF18"} 0%,transparent 70%)`}}>
      <div style={{padding:"40px 24px 20px"}}>
        <div style={{display:"flex",gap:8,marginBottom:32}}>{[1,2,3].map(s=><div key={s} style={{flex:1,height:4,borderRadius:2,background:s<=step?grads[s-1]:"rgba(255,255,255,0.1)",transition:"background 0.4s"}}/>)}</div>
        <div style={{color:C.muted,fontSize:13,fontWeight:700,textTransform:"uppercase",letterSpacing:2,marginBottom:8}}>Step {step} of 3 · {labels[step-1]}</div>
        <div style={{fontFamily:fr,fontSize:28,color:"#FFF",lineHeight:1.2,animation:"fadeUp 0.5s ease both"}}>{step===1?"Hello! Let's get to know you 👋":step===2?"Which tribe do you belong to? 🦁":"What sounds do you find tricky? 🎯"}</div>
      </div>
      <div style={{flex:1,padding:"0 24px",overflowY:"auto",animation:"fadeUp 0.5s ease 0.1s both"}}>
        {step===1&&<div style={{display:"flex",flexDirection:"column",gap:16}}>
          {[{label:"Your Name",val:name,set:setName,ph:"e.g. Amina, John, Wanjiku",type:"text"},{label:"Your Age",val:age,set:setAge,ph:"e.g. 12",type:"number"}].map(f=>(
            <div key={f.label}>
              <div style={{color:C.muted,fontSize:13,fontWeight:700,marginBottom:8,textTransform:"uppercase",letterSpacing:1}}>{f.label}</div>
              <input type={f.type} value={f.val} onChange={e=>f.set(e.target.value)} placeholder={f.ph} style={{width:"100%",background:"rgba(255,255,255,0.07)",border:`1.5px solid ${C.border}`,borderRadius:16,padding:"14px 18px",color:"#FFF",fontSize:16,fontFamily:ff,fontWeight:600}}/>
            </div>
          ))}
          <div>
            <div style={{color:C.muted,fontSize:13,fontWeight:700,marginBottom:8,textTransform:"uppercase",letterSpacing:1}}>School Year / Class</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>{YEARS.map(y=><button key={y} onClick={()=>setYear(y)} style={{padding:"10px 12px",borderRadius:12,border:`1.5px solid ${year===y?C.orange:C.border}`,background:year===y?"rgba(255,107,53,0.2)":"rgba(255,255,255,0.04)",color:year===y?C.orange:"rgba(255,255,255,0.7)",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:ff,transition:"all 0.2s"}}>{y}</button>)}</div>
          </div>
        </div>}
        {step===2&&<div>
          <input placeholder="Search your tribe..." value={tribeSearch} onChange={e=>setTribeSearch(e.target.value)} style={{width:"100%",background:"rgba(255,255,255,0.07)",border:`1.5px solid ${C.border}`,borderRadius:16,padding:"13px 18px",color:"#FFF",fontSize:15,fontFamily:ff,fontWeight:600,marginBottom:16}}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,maxHeight:380,overflowY:"auto"}}>{filtered.map(t=><button key={t} onClick={()=>setTribe(t)} style={{padding:"12px 10px",borderRadius:14,border:`1.5px solid ${tribe===t?C.green:C.border}`,background:tribe===t?"rgba(34,211,162,0.18)":"rgba(255,255,255,0.04)",color:tribe===t?C.green:"rgba(255,255,255,0.75)",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:ff,transition:"all 0.2s"}}>{t}</button>)}</div>
        </div>}
        {step===3&&<div>
          {sug.length>0&&<div style={{padding:"14px 16px",borderRadius:14,background:"rgba(155,109,255,0.12)",border:"1px solid rgba(155,109,255,0.3)",marginBottom:20}}>
            <div style={{color:C.purple,fontSize:13,fontWeight:800,marginBottom:4}}>✨ Suggested for {tribe}</div>
            <div style={{color:"rgba(255,255,255,0.7)",fontSize:13}}>{sug.map(id=>SOUNDS.find(s=>s.id===id)?.label).join(" · ")}</div>
            <button onClick={()=>setSounds(sug)} style={{marginTop:10,padding:"7px 14px",borderRadius:10,border:"none",background:C.twilight,color:"#FFF",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:ff}}>Auto-select →</button>
          </div>}
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {SOUNDS.map(s=>{const sel=sounds.includes(s.id),isSug=sug.includes(s.id);return(
              <button key={s.id} onClick={()=>toggle(s.id)} style={{display:"flex",alignItems:"flex-start",gap:14,padding:"14px 16px",borderRadius:16,border:`1.5px solid ${sel?"rgba(155,109,255,0.8)":isSug?"rgba(155,109,255,0.25)":C.border}`,background:sel?"rgba(155,109,255,0.18)":isSug?"rgba(155,109,255,0.06)":"rgba(255,255,255,0.04)",cursor:"pointer",textAlign:"left",transition:"all 0.2s"}}>
                <span style={{fontSize:26,flexShrink:0}}>{s.icon}</span>
                <div><div style={{color:"#FFF",fontSize:14,fontWeight:800,marginBottom:2}}>{s.label}{isSug&&!sel&&<span style={{marginLeft:6,fontSize:10,color:C.purple,fontWeight:700,background:"rgba(155,109,255,0.2)",padding:"1px 6px",borderRadius:6}}>SUGGESTED</span>}</div>
                <div style={{color:C.muted,fontSize:12}}>{s.desc}</div><div style={{color:"rgba(255,255,255,0.4)",fontSize:11,marginTop:3}}>{s.note}</div></div>
                <div style={{marginLeft:"auto",width:22,height:22,borderRadius:"50%",flexShrink:0,background:sel?C.twilight:"rgba(255,255,255,0.1)",display:"flex",alignItems:"center",justifyContent:"center"}}>{sel&&<span style={{color:"#FFF",fontSize:12}}>✓</span>}</div>
              </button>
            );})}
          </div>
        </div>}
      </div>
      <div style={{padding:"20px 24px 36px"}}>
        <button disabled={!ok} onClick={step<3?()=>setStep(s=>s+1):()=>onDone({name:name.trim(),age,year,tribe,sounds})}
          style={{width:"100%",padding:"17px",borderRadius:18,border:"none",background:ok?grads[step-1]:"rgba(255,255,255,0.1)",color:ok?"#FFF":"rgba(255,255,255,0.3)",fontSize:17,fontWeight:900,cursor:ok?"pointer":"default",fontFamily:fr,transition:"all 0.3s",boxShadow:ok?"0 8px 30px rgba(0,0,0,0.4)":"none"}}>
          {step<3?"Continue →":"Let's Go! 🚀"}
        </button>
      </div>
    </div>
  );
}

/* ─── WORD CARD ─── */
function WordCard({entry,onSpeak,speaking,isFav,onToggleFav,onBack}){
  const col=entry.source==="dictionary"?C.blue:(CAT_COLORS[entry.category]||C.orange);
  const isNow=speaking===entry.word;
  return(
    <div style={{background:C.bg,minHeight:"100vh",fontFamily:ff,maxWidth:480,margin:"0 auto",backgroundImage:`radial-gradient(ellipse at 50% 10%,${col}18 0%,transparent 60%)`}}>
      <div style={{padding:"52px 20px 30px"}}>
        <button onClick={onBack} style={{background:"rgba(255,255,255,0.07)",border:"none",borderRadius:12,padding:"8px 14px",color:"rgba(255,255,255,0.7)",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:ff,marginBottom:24}}>← Back</button>
        <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
          <div style={{padding:"4px 12px",borderRadius:20,background:`${col}25`,border:`1px solid ${col}50`,color:col,fontSize:12,fontWeight:800,textTransform:"uppercase",letterSpacing:1}}>{entry.category}</div>
          {entry.source==="dictionary"&&<div style={{padding:"4px 12px",borderRadius:20,background:"rgba(56,189,248,0.15)",border:"1px solid rgba(56,189,248,0.3)",color:C.blue,fontSize:12,fontWeight:800}}>🌐 Wiktionary</div>}
          {entry.audioUrl&&<div style={{padding:"4px 12px",borderRadius:20,background:"rgba(247,201,72,0.12)",border:"1px solid rgba(247,201,72,0.25)",color:C.yellow,fontSize:12,fontWeight:800}}>🎵 Real audio</div>}
        </div>
        <div style={{fontFamily:fr,fontSize:52,color:"#FFF",lineHeight:1,marginBottom:8}}>{entry.word}</div>
        <div style={{color:C.muted,fontSize:16,fontWeight:600,marginBottom:28}}>{entry.pos}</div>

        <div style={{background:"rgba(255,255,255,0.05)",border:`1.5px solid ${C.border}`,borderRadius:24,padding:24,marginBottom:14}}>
          <div style={{color:C.muted,fontSize:11,fontWeight:800,textTransform:"uppercase",letterSpacing:2,marginBottom:10}}>Pronunciation</div>
          <div style={{fontSize:26,color:col,fontWeight:800,marginBottom:6,fontFamily:"'Courier New',monospace",letterSpacing:2}}>{entry.phonetic}</div>
          <div style={{display:"inline-block",padding:"6px 14px",borderRadius:20,background:`${col}20`,color:"#FFF",fontSize:17,fontWeight:700,marginBottom:18}}>{entry.simple}</div>
          <button onClick={()=>onSpeak(entry.word,entry.audioUrl)} style={{display:"flex",alignItems:"center",gap:12,width:"100%",padding:"15px 18px",borderRadius:18,border:"none",background:isNow?`${col}30`:`linear-gradient(135deg,${col}cc,${col}88)`,cursor:"pointer",transition:"all 0.3s"}}>
            <div style={{width:44,height:44,borderRadius:"50%",background:isNow?"rgba(255,255,255,0.15)":col,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0,animation:isNow?"pulse 1s ease infinite":"none"}}>{isNow?"🔊":"▶"}</div>
            <div style={{textAlign:"left"}}>
              <div style={{color:"#FFF",fontSize:15,fontWeight:900,fontFamily:fr}}>{isNow?"Listening...":"Hear Pronunciation"}</div>
              <div style={{color:"rgba(255,255,255,0.55)",fontSize:12}}>{entry.audioUrl?"Real recorded audio":"AI Text-to-Speech (en-GB)"}</div>
            </div>
          </button>
        </div>

        <div style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${C.border}`,borderRadius:18,padding:18,marginBottom:12}}>
          <div style={{color:C.muted,fontSize:11,fontWeight:800,textTransform:"uppercase",letterSpacing:2,marginBottom:8}}>Definition</div>
          <div style={{color:"#FFF",fontSize:15,fontWeight:600,lineHeight:1.7}}>{entry.definition}</div>
          {entry.synonyms?.length>0&&<div style={{marginTop:10,display:"flex",gap:6,flexWrap:"wrap"}}>{entry.synonyms.map(s=><span key={s} style={{padding:"3px 10px",borderRadius:10,background:"rgba(255,255,255,0.07)",color:C.muted,fontSize:12,fontWeight:700}}>{s}</span>)}</div>}
        </div>

        <div style={{background:`${col}12`,border:`1px solid ${col}30`,borderRadius:18,padding:18,marginBottom:12}}>
          <div style={{color:col,fontSize:11,fontWeight:800,textTransform:"uppercase",letterSpacing:2,marginBottom:8}}>Example</div>
          <div style={{color:"rgba(255,255,255,0.85)",fontSize:14,fontWeight:600,fontStyle:"italic",lineHeight:1.7}}>"{entry.example}"</div>
          <button onClick={()=>onSpeak(entry.example,null)} style={{marginTop:10,padding:"7px 14px",borderRadius:10,border:`1px solid ${col}40`,background:"transparent",color:col,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:ff}}>🔊 Hear example</button>
        </div>

        {entry.allMeanings?.length>1&&<div style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${C.border}`,borderRadius:18,padding:18,marginBottom:12}}>
          <div style={{color:C.muted,fontSize:11,fontWeight:800,textTransform:"uppercase",letterSpacing:2,marginBottom:10}}>More Meanings</div>
          {entry.allMeanings.slice(1).map((m,i)=><div key={i} style={{marginBottom:10,paddingBottom:10,borderBottom:i<entry.allMeanings.length-2?`1px solid ${C.border}`:"none"}}>
            <div style={{color:C.purple,fontSize:12,fontWeight:800,marginBottom:4,textTransform:"capitalize"}}>{m.partOfSpeech}</div>
            <div style={{color:"rgba(255,255,255,0.7)",fontSize:13,lineHeight:1.6}}>{m.definitions?.[0]?.definition}</div>
          </div>)}
        </div>}

        <button onClick={()=>onToggleFav(entry.word)} style={{width:"100%",padding:"14px",borderRadius:16,border:`1.5px solid ${isFav?C.pink+"80":C.border}`,background:isFav?"rgba(244,114,182,0.15)":"transparent",color:isFav?C.pink:"rgba(255,255,255,0.5)",fontSize:15,fontWeight:800,cursor:"pointer",fontFamily:ff,display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:30}}>
          {isFav?"♥ Saved to Favourites":"♡ Save to Favourites"}
        </button>
      </div>
    </div>
  );
}

/* ─── MAIN APP ─── */
export default function App(){
  const[appState,setAppState]=useState("splash");
  const[user,setUser]=useState(null);
  const[tab,setTab]=useState("home");
  const[query,setQuery]=useState("");
  const[selectedWord,setSelectedWord]=useState(null);
  const[favs,setFavs]=useState([]);
  const[speaking,setSpeaking]=useState(null);
  const[practiceIdx,setPracticeIdx]=useState(0);
  const[category,setCategory]=useState("all");
  const[searchResult,setSearchResult]=useState(null);
  const[searching,setSearching]=useState(false);
  const[searchError,setSearchError]=useState(false);
  const[apiCache,setApiCache]=useState({});
  const searchTimer=useRef(null);

  useEffect(()=>{if(appState==="splash"){const t=setTimeout(()=>setAppState("onboard"),3200);return()=>clearTimeout(t);}},[appState]);

  useEffect(()=>{
    if(!query.trim()){setSearchResult(null);setSearchError(false);setSearching(false);return;}
    const local=LOCAL_WORDS.find(w=>w.word.toLowerCase()===query.toLowerCase().trim());
    if(local){setSearchResult(local);setSearchError(false);setSearching(false);return;}
    const cached=apiCache[query.toLowerCase()];
    if(cached){setSearchResult(cached);setSearchError(false);setSearching(false);return;}
    clearTimeout(searchTimer.current);
    if(query.trim().length>=2){
      setSearching(true);setSearchError(false);setSearchResult(null);
      searchTimer.current=setTimeout(async()=>{
        const result=await fetchFromAPI(query.trim());
        setSearching(false);
        if(result){setSearchResult(result);setApiCache(c=>({...c,[query.toLowerCase()]:result}));}
        else{setSearchError(true);}
      },700);
    }
    return()=>clearTimeout(searchTimer.current);
  },[query]);

  const handleSpeak=useCallback((text,audioUrl)=>{setSpeaking(text);speak(text,audioUrl,()=>setSpeaking(null));},[]);
  const toggleFav=word=>setFavs(f=>f.includes(word)?f.filter(x=>x!==word):[...f,word]);
  const favWords=[...LOCAL_WORDS.filter(w=>favs.includes(w.word)),...Object.values(apiCache).filter(w=>favs.includes(w.word))];

  if(appState==="splash")return<SplashScreen/>;
  if(appState==="onboard")return<OnboardScreen onDone={u=>{setUser(u);setAppState("main");}}/>;
  if(selectedWord)return<WordCard entry={selectedWord} onSpeak={handleSpeak} speaking={speaking} isFav={favs.includes(selectedWord.word)} onToggleFav={toggleFav} onBack={()=>setSelectedWord(null)}/>;

  const suggestions=query.length>=1?LOCAL_WORDS.filter(w=>w.word.toLowerCase().startsWith(query.toLowerCase())).slice(0,5):[];
  const catWords=category==="all"?LOCAL_WORDS:LOCAL_WORDS.filter(w=>w.category===category);
  const wod=LOCAL_WORDS[(new Date().getDate()+new Date().getMonth()*31)%LOCAL_WORDS.length];
  const pw=LOCAL_WORDS[practiceIdx%40];
  const NAV=[{id:"home",icon:"🏠",label:"Home"},{id:"search",icon:"🔍",label:"Search"},{id:"practice",icon:"🎯",label:"Practice"},{id:"favourites",icon:"♥",label:"Saved"},{id:"profile",icon:"👤",label:"Profile"}];
  const NC=[C.orange,C.blue,C.green,C.pink,C.purple];

  /* HOME */
  const HomeTab=(
    <div style={{padding:"0 16px 20px",animation:"fadeUp 0.4s ease both"}}>
      <div style={{paddingTop:52,paddingBottom:16}}>
        <div style={{color:C.muted,fontSize:14,fontWeight:600}}>Welcome back, <span style={{color:C.yellow}}>{user?.name||"Learner"}</span> 👋</div>
        <div style={{fontFamily:fr,fontSize:28,color:"#FFF",marginTop:4}}>What will you <span style={{background:C.sun,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>learn</span> today?</div>
      </div>

      <div style={{display:"flex",gap:10,marginBottom:16}}>
        {[{icon:"📚",val:"500+",lbl:"Local words"},{icon:"🌐",val:"100k+",lbl:"Wiktionary"},{icon:"🎵",val:"Real",lbl:"Audio"}].map((s,i)=>(
          <div key={i} style={{flex:1,background:"rgba(255,255,255,0.04)",border:`1px solid ${C.border}`,borderRadius:14,padding:"10px 6px",textAlign:"center"}}>
            <div style={{fontSize:18}}>{s.icon}</div>
            <div style={{color:"#FFF",fontWeight:900,fontSize:14,fontFamily:fr}}>{s.val}</div>
            <div style={{color:C.muted,fontSize:10,fontWeight:700}}>{s.lbl}</div>
          </div>
        ))}
      </div>

      <div style={{display:"flex",alignItems:"center",gap:10,background:"rgba(255,255,255,0.07)",borderRadius:16,padding:"13px 16px",marginBottom:20,border:`1.5px solid ${C.border}`,cursor:"text"}} onClick={()=>setTab("search")}>
        <span style={{fontSize:18}}>🔍</span>
        <span style={{color:C.muted,fontSize:15,fontWeight:600,flex:1}}>Search any English word...</span>
        <span style={{color:C.green,fontSize:11,fontWeight:800,background:"rgba(34,211,162,0.12)",padding:"2px 8px",borderRadius:10}}>100k+</span>
      </div>

      <div style={{background:"linear-gradient(135deg,#FF6B3520,#F7C94815)",border:"1.5px solid rgba(255,107,53,0.3)",borderRadius:22,padding:20,marginBottom:20}}>
        <div style={{color:C.orange,fontSize:11,fontWeight:900,textTransform:"uppercase",letterSpacing:2,marginBottom:8}}>⭐ Word of the Day</div>
        <div style={{fontFamily:fr,fontSize:36,color:"#FFF",marginBottom:4}}>{wod.word}</div>
        <div style={{color:"rgba(255,255,255,0.4)",fontSize:14,fontFamily:"monospace",marginBottom:8}}>{wod.phonetic}</div>
        <div style={{color:"rgba(255,255,255,0.7)",fontSize:14,lineHeight:1.5,marginBottom:14}}>{wod.definition}</div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={()=>handleSpeak(wod.word,null)} style={{flex:1,padding:"11px",borderRadius:13,border:"none",background:C.sun,color:"#FFF",fontSize:14,fontWeight:800,cursor:"pointer",fontFamily:ff}}>▶ Hear it</button>
          <button onClick={()=>setSelectedWord(wod)} style={{flex:1,padding:"11px",borderRadius:13,border:`1.5px solid ${C.border}`,background:"transparent",color:"#FFF",fontSize:14,fontWeight:800,cursor:"pointer",fontFamily:ff}}>Details</button>
        </div>
      </div>

      <div style={{color:"#FFF",fontSize:15,fontWeight:800,marginBottom:10,fontFamily:fr}}>Browse by Category</div>
      <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:8,marginBottom:16}}>
        {["all",...CATS].map(cat=>{const col=cat==="all"?C.purple:CAT_COLORS[cat]||C.orange;return<button key={cat} onClick={()=>setCategory(cat)} style={{padding:"7px 14px",borderRadius:20,border:`1.5px solid ${category===cat?col:`${col}40`}`,background:category===cat?`${col}30`:"transparent",color:category===cat?col:"rgba(255,255,255,0.55)",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:ff,whiteSpace:"nowrap",flexShrink:0,textTransform:"capitalize"}}>{cat==="all"?"All":cat}</button>;})}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {catWords.slice(0,20).map((entry,i)=>{const col=CAT_COLORS[entry.category]||C.orange;return(
          <button key={entry.word} onClick={()=>setSelectedWord(entry)} style={{display:"flex",alignItems:"center",gap:12,padding:"13px 15px",background:"rgba(255,255,255,0.04)",borderRadius:17,border:`1px solid ${C.border}`,cursor:"pointer",textAlign:"left",animation:`fadeUp 0.4s ease ${i*0.03}s both`}}>
            <div style={{width:42,height:42,borderRadius:13,background:`${col}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{entry.word[0].toUpperCase()}</div>
            <div style={{flex:1}}><div style={{color:"#FFF",fontSize:15,fontWeight:800}}>{entry.word}</div><div style={{color:C.muted,fontSize:11,fontFamily:"monospace"}}>{entry.simple}</div></div>
            <button onClick={e=>{e.stopPropagation();handleSpeak(entry.word,null);}} style={{width:32,height:32,borderRadius:9,border:"none",background:`${col}20`,color:col,fontSize:15,cursor:"pointer",animation:speaking===entry.word?"pulse 1s ease infinite":"none"}}>🔊</button>
          </button>
        );})}
      </div>
    </div>
  );

  /* SEARCH */
  const SearchTab=(
    <div style={{padding:"52px 16px 20px",animation:"fadeUp 0.4s ease both"}}>
      <div style={{fontFamily:fr,fontSize:24,color:"#FFF",marginBottom:4}}>Search <span style={{background:C.ocean,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Any Word</span></div>
      <div style={{color:C.muted,fontSize:13,fontWeight:600,marginBottom:14}}>Local database first · then Wiktionary's 100,000+ words</div>

      <div style={{background:"rgba(255,255,255,0.07)",borderRadius:18,padding:"13px 16px",marginBottom:8,border:`1.5px solid ${query?(searching?C.yellow:searchResult?C.green:searchError?"#FF6B9D":C.border):C.border}`,transition:"border 0.3s"}}>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <span style={{fontSize:20}}>{searching?"⏳":"🔍"}</span>
          <input autoFocus value={query} onChange={e=>setQuery(e.target.value)} placeholder="Type any English word..."
            style={{flex:1,background:"none",border:"none",color:"#FFF",fontSize:16,fontFamily:ff,fontWeight:700}}/>
          {query&&<button onClick={()=>{setQuery("");setSearchResult(null);setSearchError(false);}} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:18}}>✕</button>}
        </div>
      </div>

      {query&&<div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14,padding:"8px 12px",borderRadius:12,background:searching?"rgba(247,201,72,0.08)":searchResult?"rgba(34,211,162,0.08)":searchError?"rgba(255,107,157,0.08)":"transparent",border:`1px solid ${searching?"rgba(247,201,72,0.2)":searchResult?"rgba(34,211,162,0.2)":searchError?"rgba(255,107,157,0.2)":"transparent"}`}}>
        <span>{searching?"⏳":searchResult?"✅":searchError?"❌":"💭"}</span>
        <span style={{fontSize:12,fontWeight:700,color:searching?C.yellow:searchResult?C.green:searchError?C.pink:C.muted}}>
          {searching?"Searching Wiktionary...":searchResult?`"${searchResult.word}" · ${searchResult.source==="local"?"Local DB":"Wiktionary"}`:searchError?`"${query}" not found`:"Type more..."}
        </span>
      </div>}

      {suggestions.length>0&&!searchResult&&<div style={{marginBottom:14}}>
        <div style={{color:C.muted,fontSize:12,fontWeight:800,textTransform:"uppercase",letterSpacing:1.5,marginBottom:8}}>📚 Quick matches</div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {suggestions.map(entry=>{const col=CAT_COLORS[entry.category]||C.orange;return(
            <button key={entry.word} onClick={()=>setSelectedWord(entry)} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 15px",background:"rgba(255,255,255,0.05)",borderRadius:16,border:`1px solid ${C.border}`,cursor:"pointer",textAlign:"left"}}>
              <div style={{width:38,height:38,borderRadius:11,background:`${col}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{entry.word[0].toUpperCase()}</div>
              <div style={{flex:1}}><div style={{color:"#FFF",fontSize:14,fontWeight:800}}>{entry.word}</div><div style={{color:C.muted,fontSize:11,fontFamily:"monospace"}}>{entry.simple}</div></div>
              <span style={{color:C.green,fontSize:10,background:"rgba(34,211,162,0.1)",padding:"3px 7px",borderRadius:8,fontWeight:700}}>LOCAL</span>
            </button>
          );})}
        </div>
      </div>}

      {searchResult&&<div style={{background:"rgba(255,255,255,0.04)",border:`1.5px solid ${searchResult.source==="dictionary"?"rgba(56,189,248,0.3)":"rgba(34,211,162,0.3)"}`,borderRadius:22,padding:20,animation:"fadeUp 0.4s ease both"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
          <div>
            <div style={{fontFamily:fr,fontSize:34,color:"#FFF",lineHeight:1}}>{searchResult.word}</div>
            <div style={{color:C.muted,fontSize:13,marginTop:4}}>{searchResult.pos}</div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:5,alignItems:"flex-end"}}>
            <div style={{padding:"3px 10px",borderRadius:20,background:searchResult.source==="dictionary"?"rgba(56,189,248,0.15)":"rgba(34,211,162,0.15)",color:searchResult.source==="dictionary"?C.blue:C.green,fontSize:11,fontWeight:800}}>{searchResult.source==="dictionary"?"🌐 Wiktionary":"📚 Local"}</div>
            {searchResult.audioUrl&&<div style={{padding:"3px 8px",borderRadius:10,background:"rgba(247,201,72,0.12)",color:C.yellow,fontSize:10,fontWeight:800}}>🎵 Audio</div>}
          </div>
        </div>
        <div style={{background:"rgba(255,255,255,0.05)",borderRadius:14,padding:"12px 14px",marginBottom:12}}>
          <div style={{color:C.blue,fontSize:20,fontFamily:"monospace",fontWeight:800,marginBottom:4}}>{searchResult.phonetic}</div>
          <div style={{color:"rgba(255,255,255,0.8)",fontSize:14,fontWeight:700}}>{searchResult.simple}</div>
        </div>
        <div style={{color:"rgba(255,255,255,0.75)",fontSize:14,lineHeight:1.6,marginBottom:12}}>{searchResult.definition}</div>
        {searchResult.example&&<div style={{color:C.muted,fontSize:13,fontStyle:"italic",marginBottom:14}}>"{searchResult.example}"</div>}
        <div style={{display:"flex",gap:10}}>
          <button onClick={()=>handleSpeak(searchResult.word,searchResult.audioUrl)} style={{flex:1,padding:"12px",borderRadius:13,border:"none",background:C.ocean,color:"#FFF",fontSize:14,fontWeight:800,cursor:"pointer",fontFamily:ff,animation:speaking===searchResult.word?"pulse 1s ease infinite":"none"}}>{speaking===searchResult.word?"🔊 Playing...":"▶ Hear it"}</button>
          <button onClick={()=>setSelectedWord(searchResult)} style={{flex:1,padding:"12px",borderRadius:13,border:`1.5px solid ${C.border}`,background:"transparent",color:"#FFF",fontSize:14,fontWeight:800,cursor:"pointer",fontFamily:ff}}>Full Details</button>
        </div>
      </div>}

      {!query&&<div style={{marginTop:14}}>
        <div style={{color:C.muted,fontSize:12,fontWeight:800,textTransform:"uppercase",letterSpacing:1.5,marginBottom:10}}>🔥 Tricky Words</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:8}}>{LOCAL_WORDS.filter(w=>w.category==="tricky").map(w=><button key={w.word} onClick={()=>setQuery(w.word)} style={{padding:"7px 14px",borderRadius:20,background:"rgba(251,146,60,0.15)",border:"1px solid rgba(251,146,60,0.3)",color:"#FB923C",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:ff}}>{w.word}</button>)}</div>
      </div>}
    </div>
  );

  /* PRACTICE */
  const PracticeTab=(
    <div style={{padding:"52px 16px 20px",animation:"fadeUp 0.4s ease both"}}>
      <div style={{fontFamily:fr,fontSize:24,color:"#FFF",marginBottom:4}}>Practice <span style={{background:C.ocean,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Mode</span> 🎯</div>
      <div style={{color:C.muted,fontSize:13,fontWeight:600,marginBottom:20}}>Tailored for {user?.tribe||"you"}</div>
      {user?.sounds?.length>0&&<div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:8,marginBottom:18}}>{user.sounds.map(sid=>{const sc=SOUNDS.find(s=>s.id===sid);return sc?<div key={sid} style={{padding:"7px 13px",borderRadius:20,background:"rgba(34,211,162,0.15)",border:"1px solid rgba(34,211,162,0.3)",color:C.green,fontSize:12,fontWeight:800,whiteSpace:"nowrap",flexShrink:0}}>{sc.icon} {sc.label}</div>:null;})}</div>}
      <div style={{background:"linear-gradient(135deg,rgba(34,211,162,0.12),rgba(56,189,248,0.08))",border:"2px solid rgba(34,211,162,0.25)",borderRadius:26,padding:26,marginBottom:18,textAlign:"center"}}>
        <div style={{color:C.green,fontSize:12,fontWeight:800,textTransform:"uppercase",letterSpacing:2,marginBottom:12}}>Card {(practiceIdx%40)+1} of 40</div>
        <div style={{fontFamily:fr,fontSize:48,color:"#FFF",marginBottom:8}}>{pw.word}</div>
        <div style={{color:"rgba(255,255,255,0.4)",fontSize:14,fontFamily:"monospace",letterSpacing:2,marginBottom:18}}>{pw.phonetic}</div>
        <button onClick={()=>handleSpeak(pw.word,null)} style={{display:"inline-flex",alignItems:"center",gap:10,padding:"15px 28px",borderRadius:18,border:"none",background:C.ocean,color:"#FFF",fontSize:17,fontWeight:900,cursor:"pointer",fontFamily:fr,animation:speaking===pw.word?"pulse 1s ease infinite":"none",boxShadow:"0 8px 30px rgba(34,211,162,0.3)"}}>
          {speaking===pw.word?"🔊 Playing...":"▶ Hear it"}
        </button>
        <div style={{marginTop:18,color:"rgba(255,255,255,0.6)",fontSize:13,background:"rgba(255,255,255,0.05)",borderRadius:12,padding:"9px 12px"}}><span style={{color:C.muted,fontSize:11,display:"block",marginBottom:3}}>Simplified:</span>{pw.simple}</div>
      </div>
      <div style={{display:"flex",gap:10,marginBottom:20}}>
        <button onClick={()=>setPracticeIdx(i=>i>0?i-1:39)} style={{flex:1,padding:"13px",borderRadius:14,border:`1.5px solid ${C.border}`,background:"rgba(255,255,255,0.04)",color:"rgba(255,255,255,0.7)",fontSize:14,fontWeight:800,cursor:"pointer",fontFamily:ff}}>← Prev</button>
        <button onClick={()=>setSelectedWord(pw)} style={{flex:1,padding:"13px",borderRadius:14,border:`1.5px solid ${C.green}50`,background:"rgba(34,211,162,0.1)",color:C.green,fontSize:14,fontWeight:800,cursor:"pointer",fontFamily:ff}}>Details</button>
        <button onClick={()=>setPracticeIdx(i=>(i+1)%40)} style={{flex:1,padding:"13px",borderRadius:14,border:"none",background:C.ocean,color:"#FFF",fontSize:14,fontWeight:800,cursor:"pointer",fontFamily:ff}}>Next →</button>
      </div>
      {user?.sounds?.length>0&&user.sounds.map(sid=>{const sc=SOUNDS.find(s=>s.id===sid);return sc?(
        <div key={sid} style={{background:"rgba(255,255,255,0.04)",borderRadius:16,padding:14,marginBottom:10,border:`1px solid ${C.border}`}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}><span style={{fontSize:20}}>{sc.icon}</span><div><div style={{color:"#FFF",fontSize:13,fontWeight:800}}>{sc.label}</div><div style={{color:C.muted,fontSize:11}}>{sc.desc}</div></div></div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{sc.note.split(" · ").map(ex=><button key={ex} onClick={()=>handleSpeak(ex,null)} style={{padding:"5px 11px",borderRadius:9,background:"rgba(255,255,255,0.08)",border:`1px solid ${C.border}`,color:"rgba(255,255,255,0.75)",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:ff,animation:speaking===ex?"pulse 0.8s ease infinite":"none"}}>🔊 {ex}</button>)}</div>
        </div>
      ):null;})}
    </div>
  );

  /* FAVOURITES */
  const FavsTab=(
    <div style={{padding:"52px 16px 20px",animation:"fadeUp 0.4s ease both"}}>
      <div style={{fontFamily:fr,fontSize:24,color:"#FFF",marginBottom:4}}>Saved <span style={{background:C.twilight,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Words</span> ♥</div>
      <div style={{color:C.muted,fontSize:13,fontWeight:600,marginBottom:20}}>{favWords.length} word{favWords.length!==1?"s":""} saved</div>
      {favWords.length===0?<div style={{textAlign:"center",padding:"50px 20px"}}><div style={{fontSize:56,marginBottom:14}}>📚</div><div style={{color:"rgba(255,255,255,0.5)",fontSize:15,fontWeight:600}}>No saved words yet</div><div style={{color:C.muted,fontSize:13,marginTop:8}}>Tap ♡ on any word to save it here</div></div>:(
        <div style={{display:"flex",flexDirection:"column",gap:8}}>{favWords.map((entry,i)=>{const col=entry.source==="dictionary"?C.blue:(CAT_COLORS[entry.category]||C.orange);return(
          <button key={entry.word} onClick={()=>setSelectedWord(entry)} style={{display:"flex",alignItems:"center",gap:12,padding:"13px 15px",background:"rgba(255,255,255,0.04)",borderRadius:17,border:"1px solid rgba(244,114,182,0.2)",cursor:"pointer",textAlign:"left",animation:`fadeUp 0.3s ease ${i*0.05}s both`}}>
            <div style={{width:42,height:42,borderRadius:13,background:`${col}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{entry.word[0].toUpperCase()}</div>
            <div style={{flex:1}}><div style={{color:"#FFF",fontSize:15,fontWeight:800}}>{entry.word}</div><div style={{color:C.muted,fontSize:11,fontFamily:"monospace"}}>{entry.simple}</div></div>
            <button onClick={e=>{e.stopPropagation();handleSpeak(entry.word,entry.audioUrl);}} style={{width:34,height:34,borderRadius:9,border:"none",background:`${col}20`,color:col,fontSize:15,cursor:"pointer",flexShrink:0}}>🔊</button>
          </button>
        );})}
        </div>
      )}
    </div>
  );

  /* PROFILE */
  const ProfileTab=(
    <div style={{padding:"52px 16px 20px",animation:"fadeUp 0.4s ease both"}}>
      <div style={{background:"linear-gradient(135deg,rgba(155,109,255,0.2),rgba(255,107,157,0.1))",border:"1.5px solid rgba(155,109,255,0.25)",borderRadius:22,padding:22,marginBottom:18,textAlign:"center"}}>
        <div style={{width:76,height:76,borderRadius:"50%",background:C.twilight,margin:"0 auto 14px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:34,fontFamily:fr,color:"#FFF",boxShadow:"0 8px 24px rgba(155,109,255,0.4)"}}>{user?.name?user.name[0].toUpperCase():"Y"}</div>
        <div style={{fontFamily:fr,fontSize:24,color:"#FFF"}}>{user?.name||"Learner"}</div>
        <div style={{color:C.muted,fontSize:13,marginTop:4}}>{user?.tribe&&`${user.tribe} · `}{user?.year||""}</div>
        <div style={{display:"inline-block",marginTop:10,padding:"4px 12px",borderRadius:20,background:"rgba(255,107,53,0.15)",border:"1px solid rgba(255,107,53,0.3)",color:C.orange,fontSize:12,fontWeight:700}}>Age {user?.age||"?"}</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:18}}>
        {[{lbl:"Words Saved",val:favs.length,icon:"♥",col:C.pink},{lbl:"Focus Sounds",val:user?.sounds?.length||0,icon:"🎯",col:C.green},{lbl:"Local Words",val:"500+",icon:"📚",col:C.blue},{lbl:"Wiktionary",val:"100k+",icon:"🌐",col:C.yellow}].map(s=>(
          <div key={s.lbl} style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${C.border}`,borderRadius:16,padding:14,textAlign:"center"}}>
            <div style={{fontSize:26,marginBottom:5}}>{s.icon}</div>
            <div style={{color:s.col,fontFamily:fr,fontSize:22}}>{s.val}</div>
            <div style={{color:C.muted,fontSize:11,fontWeight:700}}>{s.lbl}</div>
          </div>
        ))}
      </div>
      {user?.sounds?.length>0&&<div style={{background:"rgba(255,255,255,0.04)",borderRadius:18,padding:16,marginBottom:14}}>
        <div style={{color:"#FFF",fontSize:14,fontWeight:800,fontFamily:fr,marginBottom:10}}>My Focus Sounds</div>
        {user.sounds.map(sid=>{const sc=SOUNDS.find(s=>s.id===sid);return sc?<div key={sid} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 11px",background:"rgba(155,109,255,0.1)",borderRadius:11,border:"1px solid rgba(155,109,255,0.2)",marginBottom:7}}><span style={{fontSize:18}}>{sc.icon}</span><div><div style={{color:"#FFF",fontSize:12,fontWeight:800}}>{sc.label}</div><div style={{color:C.muted,fontSize:11}}>{sc.note}</div></div></div>:null;})}
      </div>}
      <div style={{background:"rgba(255,255,255,0.03)",borderRadius:18,padding:16,border:`1px solid ${C.border}`,textAlign:"center",marginBottom:12}}>
        <div style={{fontFamily:fr,fontSize:18,color:"#FFF",marginBottom:8}}>🗣️ Pronounce with Yonah</div>
        <div style={{color:C.muted,fontSize:12,lineHeight:1.9}}>
          Developer: <span style={{color:C.yellow,fontWeight:700}}>Yonah Oduor</span><br/>
          For: <span style={{color:C.green,fontWeight:700}}>St Augustine Mabanga</span><br/>
          <span style={{color:"rgba(255,255,255,0.25)",fontSize:11}}>DB: Wiktionary · TTS: Web Speech API</span>
        </div>
      </div>
      <button onClick={()=>setAppState("onboard")} style={{width:"100%",padding:"12px",borderRadius:14,border:"1.5px solid rgba(255,107,53,0.3)",background:"rgba(255,107,53,0.1)",color:C.orange,fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:ff}}>Edit My Profile ✏️</button>
    </div>
  );

  return(
    <div style={{background:C.bg,minHeight:"100vh",fontFamily:ff,maxWidth:480,margin:"0 auto",backgroundImage:`radial-gradient(ellipse at 50% 0%,rgba(255,107,53,0.07) 0%,transparent 50%)`}}>
      <div style={{paddingBottom:80,overflowY:"auto",minHeight:"100vh"}}>
        {tab==="home"&&HomeTab}
        {tab==="search"&&SearchTab}
        {tab==="practice"&&PracticeTab}
        {tab==="favourites"&&FavsTab}
        {tab==="profile"&&ProfileTab}
      </div>
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:"rgba(7,8,15,0.92)",backdropFilter:"blur(20px)",borderTop:`1px solid ${C.border}`,display:"flex",padding:"8px 0 20px",zIndex:100}}>
        {NAV.map((n,i)=>{const active=tab===n.id,col=NC[i];return(
          <button key={n.id} onClick={()=>setTab(n.id)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,background:"none",border:"none",cursor:"pointer",padding:"5px 0",fontFamily:ff}}>
            <span style={{fontSize:21,transition:"transform 0.2s",transform:active?"scale(1.2)":"scale(1)"}}>{n.icon}</span>
            <span style={{fontSize:10,fontWeight:800,textTransform:"uppercase",letterSpacing:0.5,color:active?col:"rgba(255,255,255,0.3)"}}>{n.label}</span>
            {active&&<div style={{width:18,height:3,borderRadius:2,background:col,animation:"pop 0.3s ease both"}}/>}
          </button>
        );})}
      </div>
    </div>
  );
}
