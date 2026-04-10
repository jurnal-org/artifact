import { neon } from "@neondatabase/serverless";

const sql = neon(
  "postgresql://neondb_owner:npg_k4F5hdyvDNat@ep-long-frog-ak9p1jcy-pooler.c-3.us-west-2.aws.neon.tech/neondb?sslmode=require"
);

const USER_ID = "d675d562-3bc8-4c01-b66a-b11f5fa17f0b";

// 30 days of realistic Italian journaling data
const days = [
  {
    daysAgo: 30,
    mood: 62,
    keywords: ["stanchezza", "routine", "calma"],
    summary:
      "Francesco ha iniziato la giornata sentendosi un po' stanco dopo un weekend intenso. Ha parlato del ritorno alla routine lavorativa e di come stia cercando di organizzare meglio le sue giornate. Nonostante la stanchezza, ha espresso una certa calma nell'affrontare la settimana.",
    messages: [
      ["user", "Oggi mi sento un po' stanco, weekend intenso con amici e poco riposo"],
      ["assistant", "Capisco, a volte i weekend sociali ricaricano lo spirito ma stancano il corpo. Cosa ti è piaciuto di più di questo weekend?"],
      ["user", "La cena di sabato sera con Marco e gli altri, abbiamo riso tantissimo"],
      ["assistant", "Che bello, ridere così fa bene. Come ti senti rispetto alla settimana che inizia?"],
      ["user", "Tranquillo, ho le idee abbastanza chiare su cosa devo fare"],
      ["assistant", "Ottimo, avere chiarezza aiuta molto. Spero che la settimana vada liscia. A domani! 🌙"],
    ],
    facts: [
      { type: "person", content: "Marco è un amico stretto con cui esce spesso nel weekend", tags: ["amicizia", "socialità"] },
      { type: "emotion", content: "Si sente tranquillo nell'affrontare la settimana lavorativa", tags: ["lavoro", "serenità"] },
    ],
  },
  {
    daysAgo: 29,
    mood: 58,
    keywords: ["pressione", "lavoro", "determinazione"],
    summary:
      "Francesco ha affrontato una giornata lavorativa impegnativa con diverse deadline ravvicinate. Ha espresso frustrazione per un progetto che procede a rilento, ma anche determinazione nel portarlo a termine. Ha menzionato la necessità di parlare con il cliente per riallineare le aspettative.",
    messages: [
      ["user", "Giornata pesante, troppe cose da fare e il progetto per il cliente è in ritardo"],
      ["assistant", "Capisco la pressione. Cosa ti sta rallentando di più su quel progetto?"],
      ["user", "Il cliente continua a cambiare idea sulle specifiche, ogni volta devo rifare pezzi"],
      ["assistant", "Frustrante quando succede così. Hai pensato a come gestire questa situazione?"],
      ["user", "Sì, domani ho una call con loro, voglio mettere dei paletti chiari"],
      ["assistant", "Buona strategia, definire i confini è importante. In bocca al lupo per domani! 💪"],
    ],
    facts: [
      { type: "event", content: "Call con il cliente per riallineare le specifiche del progetto", reference_date: 28, tags: ["lavoro", "cliente"] },
      { type: "emotion", content: "Frustrato dai continui cambi di specifiche del cliente", tags: ["lavoro", "frustrazione"] },
    ],
  },
  {
    daysAgo: 28,
    mood: 71,
    keywords: ["soddisfazione", "assertività", "sollievo"],
    summary:
      "La call con il cliente è andata molto bene. Francesco è riuscito a comunicare chiaramente i limiti e le tempistiche, ottenendo un accordo su specifiche definitive. Si sente sollevato e soddisfatto della sua assertività. Ha anche fatto una corsa serale che lo ha aiutato a scaricare la tensione.",
    messages: [
      ["user", "La call è andata benissimo! Sono riuscito a farmi ascoltare"],
      ["assistant", "Fantastico! Mi avevi detto ieri che volevi mettere dei paletti. Come hai fatto?"],
      ["user", "Ho preparato un documento con tutte le modifiche fatte fin qui e i costi extra, l'hanno capito subito"],
      ["assistant", "Bravissimo, la preparazione fa sempre la differenza. Come ti senti adesso?"],
      ["user", "Molto meglio, stasera sono anche andato a correre, avevo bisogno di staccare"],
      ["assistant", "Correre è un ottimo modo per ricaricarsi. Giornata positiva! A domani 🏃"],
    ],
    facts: [
      { type: "event", content: "Call con il cliente risolta positivamente, specifiche definitive concordate", tags: ["lavoro", "cliente", "successo"] },
      { type: "theme", content: "La corsa serale come modo per scaricare lo stress", tags: ["sport", "benessere"] },
    ],
  },
  {
    daysAgo: 27,
    mood: 65,
    keywords: ["riflessione", "crescita", "equilibrio"],
    summary:
      "Giornata tranquilla in cui Francesco ha riflettuto sul suo rapporto con il lavoro. Ha notato che tende a portarsi lo stress a casa e vuole lavorare su questo aspetto. Ha parlato dell'importanza di avere hobby fuori dal lavoro e del fatto che ha ripreso a leggere.",
    messages: [
      ["user", "Oggi giornata più tranquilla, ne ho approfittato per riflettere un po'"],
      ["assistant", "Bello prendersi del tempo per sé. Su cosa hai riflettuto?"],
      ["user", "Sul fatto che ultimamente porto troppo stress a casa dal lavoro, devo staccare di più"],
      ["assistant", "È una consapevolezza importante. Hai trovato qualcosa che ti aiuta a staccare?"],
      ["user", "Ho ripreso a leggere la sera, sto leggendo un libro su stoicismo che mi piace molto"],
      ["assistant", "Ottima scelta! La lettura serale è un bel rituale per chiudere la giornata. Buona lettura 📚"],
    ],
    facts: [
      { type: "insight", content: "Vuole migliorare nel separare stress lavorativo e vita privata", tags: ["crescita", "equilibrio"] },
      { type: "theme", content: "Ha ripreso a leggere la sera, sta leggendo un libro sullo stoicismo", tags: ["lettura", "hobby"] },
    ],
  },
  {
    daysAgo: 26,
    mood: 55,
    keywords: ["nostalgia", "famiglia", "malinconia"],
    summary:
      "Francesco ha parlato dei genitori che vivono lontano e della nostalgia che prova. Non li vede da un mese e si sente in colpa per non chiamarli abbastanza spesso. Ha deciso di organizzare una visita per il prossimo weekend.",
    messages: [
      ["user", "Oggi mi mancano un po' i miei, non li vedo da un mese ormai"],
      ["assistant", "La distanza dai genitori pesa. Cosa ti ha fatto pensare a loro oggi?"],
      ["user", "Mia mamma mi ha mandato una foto del giardino, ha piantato i pomodori come ogni anno"],
      ["assistant", "Che tenero, i piccoli gesti dicono tanto. Riesci a vederli presto?"],
      ["user", "Sto pensando di andarci questo weekend, devo organizzarmi con il lavoro"],
      ["assistant", "Sarebbe bello, ti farebbe bene. Spero che riesci a organizzarti! 🏡"],
    ],
    facts: [
      { type: "person", content: "I genitori vivono lontano, non li vede da un mese", tags: ["famiglia", "genitori"] },
      { type: "event", content: "Vuole organizzare visita ai genitori nel weekend", reference_date: 22, tags: ["famiglia", "viaggio"] },
    ],
  },
  {
    daysAgo: 25,
    mood: 68,
    keywords: ["energia", "produttività", "focus"],
    summary:
      "Giornata molto produttiva. Francesco ha completato una feature importante del progetto e si sente in flow. Ha anche avuto una buona idea per un side project personale legato all'AI. L'energia è alta e il focus buono.",
    messages: [
      ["user", "Oggi sono in flow totale, ho finito la feature di autenticazione del progetto"],
      ["assistant", "Wow, i giorni in flow sono preziosi! Cosa ti ha aiutato a entrare in quello stato?"],
      ["user", "Ho iniziato presto la mattina senza distrazioni, niente social fino a pranzo"],
      ["assistant", "Una strategia che funziona! C'è altro che ti ha reso la giornata positiva?"],
      ["user", "Sì, mi è venuta un'idea per un side project con AI generativa, voglio esplorarlo"],
      ["assistant", "Interessante! Quando sei in flow le idee arrivano. Annotala e ci torni con calma. Buona serata! ✨"],
    ],
    facts: [
      { type: "insight", content: "Niente social la mattina lo aiuta a entrare in flow", tags: ["produttività", "abitudini"] },
      { type: "theme", content: "Ha un'idea per un side project legato all'AI generativa", tags: ["side-project", "ai"] },
    ],
  },
  {
    daysAgo: 24,
    mood: 72,
    keywords: ["amicizia", "gratitudine", "leggerezza"],
    summary:
      "Serata piacevole con amici. Francesco ha cenato con Sara e Luca, vecchi compagni di università. Hanno parlato di ricordi e progetti futuri. Si sente grato per le amicizie che durano nel tempo.",
    messages: [
      ["user", "Serata fantastica con Sara e Luca, non ci vedevamo da mesi"],
      ["assistant", "Che bello ritrovarsi! Di cosa avete parlato?"],
      ["user", "Ricordi dell'università, i viaggi che facevamo insieme. Luca vuole organizzare un weekend al mare questa estate"],
      ["assistant", "Bellissimo, avere amici con cui condividere ricordi e fare progetti. Ti piacerebbe il weekend al mare?"],
      ["user", "Assolutamente sì, ne abbiamo bisogno tutti. Mi sento grato per queste amicizie"],
      ["assistant", "La gratitudine per le relazioni è un sentimento prezioso. Buona notte! 🌊"],
    ],
    facts: [
      { type: "person", content: "Sara e Luca sono amici dell'università, non si vedono spesso", tags: ["amicizia", "università"] },
      { type: "event", content: "Luca vuole organizzare un weekend al mare questa estate", tags: ["amicizia", "vacanza"] },
    ],
  },
  {
    daysAgo: 23,
    mood: 48,
    keywords: ["ansia", "incertezza", "preoccupazione"],
    summary:
      "Francesco si sente ansioso per una presentazione importante che deve fare la prossima settimana al cliente. Non si sente preparato e teme di non riuscire a comunicare bene il valore del lavoro fatto. L'ansia gli sta rovinando la concentrazione.",
    messages: [
      ["user", "Sono in ansia per la presentazione di giovedì prossimo, non mi sento pronto"],
      ["assistant", "L'ansia da presentazione è comune. Cosa ti preoccupa di più?"],
      ["user", "Ho paura di non riuscire a spiegare bene le scelte tecniche al cliente, loro non sono tecnici"],
      ["assistant", "Tradurre il tecnico in qualcosa di comprensibile è una sfida. Hai provato a prepararti con delle analogie semplici?"],
      ["user", "No, forse dovrei preparare delle slide più visive e meno tecniche"],
      ["assistant", "Ottima idea, le immagini parlano più delle parole tecniche. Hai tempo per prepararti bene. Coraggio! 💪"],
    ],
    facts: [
      { type: "event", content: "Presentazione al cliente giovedì prossimo, fonte di ansia", reference_date: 19, tags: ["lavoro", "presentazione"] },
      { type: "emotion", content: "Ansia da performance per comunicazione con clienti non tecnici", tags: ["ansia", "lavoro"] },
    ],
  },
  {
    daysAgo: 22,
    mood: 78,
    keywords: ["famiglia", "amore", "serenità"],
    summary:
      "Francesco è andato a trovare i genitori come aveva programmato. Una giornata bellissima, hanno cucinato insieme e fatto una passeggiata. Si sente rigenerato e sereno. La mamma gli ha dato un barattolo della sua marmellata fatta in casa.",
    messages: [
      ["user", "Sono dai miei! Giornata bellissima, abbiamo cucinato insieme le lasagne"],
      ["assistant", "Che bello! Mi avevi detto che volevi organizzare questa visita. Come stanno?"],
      ["user", "Stanno bene, il papà ha finito di sistemare il giardino e mamma è tutta contenta dei pomodori"],
      ["assistant", "Immagino la serenità di stare con loro. Come ti senti?"],
      ["user", "Rigenerato, avevo proprio bisogno di questo. Mi ha anche dato un barattolo di marmellata 😄"],
      ["assistant", "Le mamme sanno sempre di cosa hai bisogno! Goditela fino in fondo. Buona serata! ❤️"],
    ],
    facts: [
      { type: "event", content: "Visita ai genitori riuscita, giornata rigenerante", tags: ["famiglia", "benessere"] },
      { type: "emotion", content: "Si sente rigenerato dopo la visita alla famiglia", tags: ["famiglia", "serenità"] },
    ],
  },
  {
    daysAgo: 21,
    mood: 74,
    keywords: ["motivazione", "obiettivi", "chiarezza"],
    summary:
      "Dopo il weekend con la famiglia, Francesco si sente motivato per la settimana. Ha scritto i suoi obiettivi e si sente più chiaro su dove vuole andare sia nel lavoro che nella vita. Ha anche iniziato a meditare la mattina.",
    messages: [
      ["user", "Ho iniziato la settimana scrivendo i miei obiettivi, mi sento super motivato"],
      ["assistant", "Che bella energia dopo il weekend in famiglia! Quali obiettivi ti sei dato?"],
      ["user", "Finire il progetto del cliente, iniziare il side project AI, e correre 3 volte questa settimana"],
      ["assistant", "Obiettivi concreti e bilanciati tra lavoro e benessere. Hai anche provato a meditare come dicevi?"],
      ["user", "Sì! Stamattina 10 minuti di meditazione guidata, voglio farlo diventare un'abitudine"],
      ["assistant", "10 minuti sono perfetti per iniziare. Costanza batte intensità. Buona settimana! 🧘"],
    ],
    facts: [
      { type: "theme", content: "Ha iniziato a meditare la mattina, 10 minuti guidati", tags: ["meditazione", "abitudini"] },
      { type: "event", content: "Obiettivo: correre 3 volte questa settimana", tags: ["sport", "obiettivi"] },
    ],
  },
  {
    daysAgo: 20,
    mood: 60,
    keywords: ["stanchezza", "dubbi", "pazienza"],
    summary:
      "Giornata faticosa con un bug difficile da risolvere che ha occupato tutta la mattina. Francesco ha avuto momenti di dubbio sulle sue capacità, ma ha poi trovato la soluzione. Riflette sulla pazienza necessaria nel lavoro tecnico.",
    messages: [
      ["user", "Ho passato 4 ore su un bug assurdo, mi veniva da sbattere la testa sul muro"],
      ["assistant", "Che frustrazione! L'hai risolto alla fine?"],
      ["user", "Sì, era un problema di cache che non veniva invalidata. Stupido ma nascosto"],
      ["assistant", "I bug più subdoli sono spesso quelli più semplici. Come ti senti adesso?"],
      ["user", "Sollevato ma anche un po' giù, mi chiedo se sono abbastanza bravo"],
      ["assistant", "La sindrome dell'impostore colpisce tutti, anche i migliori. Hai risolto il bug, questo è il fatto. Sii gentile con te stesso 🌟"],
    ],
    facts: [
      { type: "emotion", content: "Momenti di sindrome dell'impostore dopo debug difficile", tags: ["lavoro", "autostima"] },
      { type: "insight", content: "Ha bisogno di ricordarsi che risolvere problemi difficili è la prova delle sue competenze", tags: ["crescita", "mindset"] },
    ],
  },
  {
    daysAgo: 19,
    mood: 82,
    keywords: ["successo", "orgoglio", "riconoscimento"],
    summary:
      "La presentazione al cliente è andata benissimo! Il cliente era entusiasta del lavoro e ha fatto i complimenti. Francesco si sente orgoglioso e sollevato. Ha celebrato con una birra dopo il lavoro.",
    messages: [
      ["user", "LA PRESENTAZIONE È ANDATA ALLA GRANDE! Il cliente era entusiasta!"],
      ["assistant", "FANTASTICO! La scorsa settimana eri in ansia per questo. Cos'è andato bene?"],
      ["user", "Ho seguito il consiglio delle slide visive, hanno capito tutto al volo. Mi hanno anche fatto i complimenti"],
      ["assistant", "Vedi? La preparazione e il cambio di approccio hanno funzionato. Come ti senti?"],
      ["user", "Orgogliosissimo, mi sono preso una birra per festeggiare"],
      ["assistant", "Te la meriti tutta! Ricorda questo momento quando tornerà l'ansia. Cheers! 🍺"],
    ],
    facts: [
      { type: "event", content: "Presentazione al cliente riuscita con successo, complimenti ricevuti", tags: ["lavoro", "successo"] },
      { type: "insight", content: "Le slide visive e meno tecniche funzionano meglio con clienti non tecnici", tags: ["lavoro", "comunicazione"] },
    ],
  },
  {
    daysAgo: 18,
    mood: 70,
    keywords: ["equilibrio", "natura", "relax"],
    summary:
      "Giornata di relax dopo il successo della presentazione. Francesco ha fatto una passeggiata al parco e ha letto per un'ora su una panchina. Sente di aver trovato un buon equilibrio tra impegno e riposo.",
    messages: [
      ["user", "Oggi me la sono presa comoda, passeggiata al parco e lettura"],
      ["assistant", "Dopo la settimana intensa te lo meriti. Come sta andando il libro sullo stoicismo?"],
      ["user", "Lo sto finendo, mi ha fatto riflettere molto sull'accettare ciò che non posso controllare"],
      ["assistant", "Un insegnamento potente. Riesci ad applicarlo nella tua quotidianità?"],
      ["user", "Ci provo, tipo ieri con la presentazione: mi ero preparato al meglio e poi ho lasciato andare"],
      ["assistant", "Esatto! Preparazione + distacco dal risultato. Lo stoicismo in azione. Buona serata! 🌿"],
    ],
    facts: [
      { type: "theme", content: "Sta finendo il libro sullo stoicismo, lo trova utile nella vita quotidiana", tags: ["lettura", "filosofia"] },
      { type: "insight", content: "Applica principi stoici: preparazione massima, poi distacco dal risultato", tags: ["crescita", "mindset"] },
    ],
  },
  {
    daysAgo: 17,
    mood: 52,
    keywords: ["conflitto", "stress", "tensione"],
    summary:
      "Giornata tesa. Francesco ha avuto un disaccordo con un collega sulla direzione tecnica di un progetto. Si sente frustrato perché non riesce a far passare le sue idee. Ha bisogno di trovare un modo migliore per comunicare.",
    messages: [
      ["user", "Ho litigato con Andrea al lavoro sulla scelta del framework per il nuovo progetto"],
      ["assistant", "I disaccordi tecnici possono essere intensi. Su cosa non eravate d'accordo?"],
      ["user", "Lui vuole usare un framework vecchio per sicurezza, io vorrei innovare. Non mi ascolta"],
      ["assistant", "Entrambe le posizioni hanno senso. Cosa ti frustra di più della situazione?"],
      ["user", "Che non valorizza la mia esperienza, come se non sapessi cosa sto facendo"],
      ["assistant", "Sentirsi non riconosciuti brucia. Forse trovare dati concreti per supportare la tua idea potrebbe aiutare? Domani è un nuovo giorno 🤝"],
    ],
    facts: [
      { type: "person", content: "Andrea è un collega con cui ha avuto un conflitto sulla scelta tecnica", tags: ["lavoro", "collega"] },
      { type: "emotion", content: "Si sente non valorizzato nelle discussioni tecniche con i colleghi", tags: ["lavoro", "frustrazione"] },
    ],
  },
  {
    daysAgo: 16,
    mood: 64,
    keywords: ["riconciliazione", "dialogo", "comprensione"],
    summary:
      "Francesco e Andrea hanno parlato e trovato un compromesso. Si sono resi conto che entrambi avevano punti validi. Francesco apprezza la maturità di entrambi nel risolvere il conflitto. Ha anche fatto la seconda corsa della settimana.",
    messages: [
      ["user", "Ho parlato con Andrea oggi, abbiamo trovato un compromesso"],
      ["assistant", "Che bello! Mi avevi detto ieri che la situazione ti pesava. Cos'avete deciso?"],
      ["user", "Useremo il framework nuovo ma con una fase di test più lunga, così lui è tranquillo"],
      ["assistant", "Un ottimo compromesso che soddisfa entrambi. Come vi siete lasciati?"],
      ["user", "Bene, ci siamo anche presi un caffè insieme. Siamo adulti alla fine"],
      ["assistant", "La capacità di risolvere conflitti è una skill preziosa. Bravo! Buona serata ☕"],
    ],
    facts: [
      { type: "event", content: "Conflitto con Andrea risolto con compromesso: framework nuovo con fase di test più lunga", tags: ["lavoro", "conflitto-risolto"] },
      { type: "insight", content: "I compromessi tecnici funzionano quando entrambe le parti si sentono ascoltate", tags: ["lavoro", "comunicazione"] },
    ],
  },
  {
    daysAgo: 15,
    mood: 45,
    keywords: ["solitudine", "tristezza", "introspezione"],
    summary:
      "Francesco si sente solo oggi. I piani per la serata sono saltati e si ritrova a casa da solo. Riflette sul fatto che nonostante abbia amici, a volte sente la mancanza di una relazione. Non è una tristezza acuta, più una malinconia di fondo.",
    messages: [
      ["user", "Serata da solo, i piani sono saltati. Mi sento un po' giù"],
      ["assistant", "Mi dispiace, le serate impreviste da soli possono pesare. Cosa ti fa sentire giù?"],
      ["user", "Non è solo stasera, a volte mi manca avere qualcuno, una relazione"],
      ["assistant", "È un sentimento molto umano. Ne hai parlato con qualcuno di questo?"],
      ["user", "No, non è il tipo di cosa di cui parlo facilmente. Ma qui mi sento libero di dirlo"],
      ["assistant", "Grazie per la fiducia. Non c'è fretta per niente, ma riconoscere cosa desideri è il primo passo. Sii gentile con te stesso stasera 💙"],
    ],
    facts: [
      { type: "emotion", content: "Sente la mancanza di una relazione sentimentale, malinconia di fondo", tags: ["relazioni", "solitudine"] },
      { type: "insight", content: "Trova più facile esprimere emozioni intime nel journaling che parlando con altri", tags: ["emozioni", "comunicazione"] },
    ],
  },
  {
    daysAgo: 14,
    mood: 66,
    keywords: ["ripresa", "sport", "energia"],
    summary:
      "Francesco si è svegliato con più energia dopo la serata riflessiva. È andato a correre la mattina e ha raggiunto un nuovo personal best sui 5km. Lo sport lo ha aiutato a riconnettersi con se stesso e a ritrovare positività.",
    messages: [
      ["user", "Corsa mattutina e nuovo record sui 5km! 24 minuti e 30 secondi"],
      ["assistant", "Complimenti! Dopo ieri sera avevi bisogno di qualcosa di positivo. Come ti senti?"],
      ["user", "Molto meglio, correre mi resetta sempre. Il corpo guida la mente"],
      ["assistant", "Una filosofia saggia. Hai raggiunto il tuo obiettivo di 3 corse questa settimana?"],
      ["user", "Sì! Questa è la terza. Sono contento di aver mantenuto l'impegno"],
      ["assistant", "Obiettivo raggiunto! La costanza ripaga sempre. Buona giornata campione! 🏆"],
    ],
    facts: [
      { type: "event", content: "Nuovo personal best sui 5km: 24 minuti e 30 secondi", tags: ["sport", "corsa"] },
      { type: "theme", content: "Lo sport (corsa) è il suo modo principale per gestire emozioni negative", tags: ["sport", "benessere"] },
    ],
  },
  {
    daysAgo: 13,
    mood: 73,
    keywords: ["creatività", "ispirazione", "progetto"],
    summary:
      "Francesco ha dedicato la serata al side project AI. Ha creato un prototipo funzionante e si sente ispirato. È entusiasta delle possibilità e vuole dedicarci più tempo. La creatività fuori dal lavoro lo ricarica.",
    messages: [
      ["user", "Ho lavorato al side project stasera, ho un prototipo che funziona!"],
      ["assistant", "Wow, mi avevi parlato di questa idea qualche giorno fa. Di cosa si tratta esattamente?"],
      ["user", "Un tool che usa AI per generare riassunti personalizzati di articoli basandosi sui tuoi interessi"],
      ["assistant", "Interessante! Unisce AI e personalizzazione. Qual è il prossimo passo?"],
      ["user", "Devo migliorare la qualità dei riassunti e aggiungere le fonti. Ma sono carico!"],
      ["assistant", "L'entusiasmo per un progetto personale è prezioso, nutre la creatività. Avanti così! 🚀"],
    ],
    facts: [
      { type: "event", content: "Prototipo funzionante del side project: tool AI per riassunti personalizzati di articoli", tags: ["side-project", "ai"] },
      { type: "emotion", content: "La creatività sui progetti personali lo ricarica molto", tags: ["creatività", "energia"] },
    ],
  },
  {
    daysAgo: 12,
    mood: 57,
    keywords: ["stanchezza", "routine", "accettazione"],
    summary:
      "Giornata nella media, né positiva né negativa. Francesco sente la fatica della routine settimanale. Ha meditato la mattina e nota che l'abitudine sta diventando più naturale. Accetta che non tutte le giornate devono essere speciali.",
    messages: [
      ["user", "Giornata meh, niente di particolare, solo routine"],
      ["assistant", "Non tutte le giornate devono essere straordinarie. Come è andata la meditazione mattutina?"],
      ["user", "Bene, sta diventando più facile. Oggi sono riuscito a non pensare al lavoro per 10 minuti interi"],
      ["assistant", "Questo è un progresso enorme! 10 minuti di presenza totale non è poco. Qualcos'altro?"],
      ["user", "No, davvero una giornata qualunque. E va bene così"],
      ["assistant", "L'accettazione delle giornate normali è saggezza. A domani! 🍃"],
    ],
    facts: [
      { type: "insight", content: "Sta imparando ad accettare le giornate ordinarie senza sentirsi in colpa", tags: ["crescita", "accettazione"] },
    ],
  },
  {
    daysAgo: 11,
    mood: 76,
    keywords: ["sorpresa", "gioia", "connessione"],
    summary:
      "Giornata inaspettatamente bella. Un vecchio amico di liceo, Davide, lo ha contattato dopo anni. Hanno parlato al telefono per un'ora rivivendo ricordi. Francesco riflette su come le connessioni importanti resistano al tempo.",
    messages: [
      ["user", "Davide, un amico del liceo, mi ha chiamato dal nulla dopo 3 anni!"],
      ["assistant", "Che bella sorpresa! Cosa vi siete detti?"],
      ["user", "Di tutto, ricordi del liceo, cosa facciamo adesso. Lui si è trasferito a Berlino per lavoro"],
      ["assistant", "Bellissimo riconnettersi dopo tanto. Vi rivedrete?"],
      ["user", "Viene in Italia a giugno, vogliamo vederci. Mi ha ricordato quanto mi mancasse"],
      ["assistant", "Le amicizie vere non hanno bisogno di frequenza per restare forti. Che bella giornata! 📞"],
    ],
    facts: [
      { type: "person", content: "Davide è un amico del liceo che vive a Berlino, riconnessi dopo 3 anni", tags: ["amicizia", "liceo"] },
      { type: "event", content: "Davide viene in Italia a giugno, vogliono vedersi", reference_date: -50, tags: ["amicizia", "viaggio"] },
    ],
  },
  {
    daysAgo: 10,
    mood: 43,
    keywords: ["frustrazione", "salute", "preoccupazione"],
    summary:
      "Francesco ha mal di schiena da qualche giorno e oggi è peggiorato. Non riesce a lavorare bene e si preoccupa perché non può correre. Ha deciso di prenotare un fisioterapista. La frustrazione per i limiti fisici lo mette di cattivo umore.",
    messages: [
      ["user", "Ho mal di schiena da 3 giorni e oggi è peggiorato, non riesco a stare seduto"],
      ["assistant", "Mi dispiace, il dolore fisico influenza tutto. Hai idea di cosa l'abbia causato?"],
      ["user", "Probabilmente la postura alla scrivania e il fatto che ho intensificato la corsa troppo velocemente"],
      ["assistant", "Ha senso. Hai pensato a farla vedere?"],
      ["user", "Devo prenotare un fisioterapista, lo faccio domani. Mi rode non poter correre"],
      ["assistant", "Capisco la frustrazione. Prenditi cura del corpo ora, la corsa può aspettare. Guarisci presto! 🙏"],
    ],
    facts: [
      { type: "event", content: "Mal di schiena, deve prenotare fisioterapista", reference_date: 9, tags: ["salute", "fisioterapia"] },
      { type: "theme", content: "Postura alla scrivania + corsa troppo intensa hanno causato mal di schiena", tags: ["salute", "sport"] },
    ],
  },
  {
    daysAgo: 9,
    mood: 50,
    keywords: ["pazienza", "cura", "lentezza"],
    summary:
      "Ha prenotato il fisioterapista per venerdì. Il mal di schiena è un po' meglio ma ancora presente. Francesco pratica la pazienza che sta imparando dal libro stoico. Ha lavorato da casa per stare più comodo.",
    messages: [
      ["user", "Ho prenotato il fisio per venerdì. Oggi lavoro da casa, la schiena è un po' meglio"],
      ["assistant", "Bene che hai prenotato! Come gestisci la frustrazione di non poter fare le tue attività?"],
      ["user", "Cerco di applicare quello che ho letto sullo stoicismo, accettare quello che non posso cambiare ora"],
      ["assistant", "Hai fatto molta strada da quando hai iniziato quel libro. Riesci a lavorare?"],
      ["user", "Sì, più lentamente ma sì. Ho anche fatto stretching che mi ha aiutato"],
      ["assistant", "Lo stretching è un ottimo primo passo. Venerdì il fisio ti darà un piano. Forza! 🧘‍♂️"],
    ],
    facts: [
      { type: "event", content: "Appuntamento fisioterapista venerdì", reference_date: 7, tags: ["salute", "fisioterapia"] },
      { type: "insight", content: "Lo stretching allevia il mal di schiena, da incorporare nella routine", tags: ["salute", "abitudini"] },
    ],
  },
  {
    daysAgo: 8,
    mood: 69,
    keywords: ["gratitudine", "prospettiva", "serenità"],
    summary:
      "Francesco ha avuto una bella conversazione con Sara che gli ha dato prospettiva sui suoi problemi. Si rende conto che tende ad amplificare le difficoltà. La schiena migliora e si sente grato per le piccole cose.",
    messages: [
      ["user", "Ho parlato con Sara, mi ha fatto notare che tendo a fare catastrofico"],
      ["assistant", "Un'osservazione utile! In che contesto l'ha detto?"],
      ["user", "Le stavo parlando della schiena come se fosse la fine del mondo, lei mi ha ricordato che guarisce"],
      ["assistant", "A volte serve uno specchio esterno. Sei d'accordo con la sua osservazione?"],
      ["user", "Sì, è vero. Devo lavorare su questo, apprezzare di più quello che va bene"],
      ["assistant", "La consapevolezza è metà del lavoro. Hai persone preziose intorno a te. Buona serata! 🌟"],
    ],
    facts: [
      { type: "insight", content: "Tende a catastrofizzare i problemi, Sara glielo ha fatto notare", tags: ["crescita", "mindset"] },
      { type: "person", content: "Sara è un'amica che lo aiuta a ridimensionare i problemi", tags: ["amicizia", "supporto"] },
    ],
  },
  {
    daysAgo: 7,
    mood: 71,
    keywords: ["sollievo", "cura", "progresso"],
    summary:
      "La visita dal fisioterapista è andata bene. Ha una contrattura muscolare risolvibile con esercizi mirati. Francesco è sollevato che non sia nulla di grave. Ha ripreso a meditare con costanza.",
    messages: [
      ["user", "Sono stato dal fisio, è una contrattura. Niente di grave!"],
      ["assistant", "Che sollievo! Ti avevo visto preoccupato. Ti ha dato un piano?"],
      ["user", "Sì, esercizi specifici da fare ogni giorno e niente corsa per una settimana"],
      ["assistant", "Una settimana senza corsa è gestibile. Come ti senti emotivamente?"],
      ["user", "Molto sollevato. Avevo fatto il catastrofico come dice Sara 😄"],
      ["assistant", "Almeno ne sei consapevole! Segui gli esercizi e tornerai a correre presto. Buon weekend! 💪"],
    ],
    facts: [
      { type: "event", content: "Diagnosi fisioterapista: contrattura muscolare, esercizi giornalieri, no corsa per una settimana", tags: ["salute", "fisioterapia"] },
    ],
  },
  {
    daysAgo: 6,
    mood: 80,
    keywords: ["felicità", "weekend", "natura"],
    summary:
      "Weekend splendido. Francesco è andato a fare una gita al lago con Marco. Tempo perfetto, hanno fatto un picnic e parlato di vita. Si sente felice e in pace. Il mal di schiena è quasi passato.",
    messages: [
      ["user", "Gita al lago con Marco oggi! Tempo perfetto, picnic sull'erba"],
      ["assistant", "Bellissimo! Marco è sempre una buona compagnia. Com'è stata la giornata?"],
      ["user", "Fantastica, abbiamo parlato per ore, cibo buono, sole. Felicità semplice"],
      ["assistant", "Le giornate così ricaricano profondamente. Come sta la schiena?"],
      ["user", "Molto meglio! Gli esercizi del fisio stanno funzionando, quasi non la sento più"],
      ["assistant", "Tutto sta tornando al suo posto. Goditi il resto del weekend! ☀️"],
    ],
    facts: [
      { type: "event", content: "Gita al lago con Marco, giornata rigenerante", tags: ["amicizia", "natura"] },
      { type: "theme", content: "La felicità semplice (natura, amici, cibo) è ciò che lo rende più felice", tags: ["benessere", "valori"] },
    ],
  },
  {
    daysAgo: 5,
    mood: 75,
    keywords: ["pianificazione", "ottimismo", "energia"],
    summary:
      "Francesco inizia la settimana con energia. Ha pianificato bene le giornate e si sente ottimista. Il progetto del cliente è in fase finale e il side project AI sta progredendo. Ha ripreso la meditazione mattutina dopo averla saltata nel weekend.",
    messages: [
      ["user", "Nuova settimana, mi sento carico. Ho pianificato tutto bene"],
      ["assistant", "L'energia del weekend si sente! Cosa hai in programma questa settimana?"],
      ["user", "Chiudere il progetto del cliente e dedicare almeno 2 sere al side project"],
      ["assistant", "Obiettivi chiari. Come va la meditazione mattutina?"],
      ["user", "L'ho saltata nel weekend ma stamattina l'ho ripresa. Ormai fa parte della routine"],
      ["assistant", "Saltare e riprendere fa parte del processo. L'importante è non mollare del tutto. Grande settimana! 🌅"],
    ],
    facts: [
      { type: "event", content: "Progetto del cliente in fase di chiusura questa settimana", tags: ["lavoro", "milestone"] },
      { type: "theme", content: "La meditazione mattutina è diventata un'abitudine stabile nella routine", tags: ["meditazione", "abitudini"] },
    ],
  },
  {
    daysAgo: 4,
    mood: 85,
    keywords: ["traguardo", "orgoglio", "celebrazione"],
    summary:
      "Il progetto del cliente è stato consegnato! Il cliente è soddisfatto e ha già parlato di un possibile follow-up. Francesco si sente orgoglioso del percorso fatto, ricordando l'ansia iniziale e i problemi lungo la strada. Ha celebrato con una cena fuori.",
    messages: [
      ["user", "HO CONSEGNATO IL PROGETTO! Il cliente è super contento, parlano già di fase 2!"],
      ["assistant", "CONGRATULAZIONI! Che viaggio è stato - ricordo l'ansia per la presentazione e i cambi di specifiche. Come ti senti?"],
      ["user", "Orgogliosissimo. Guardando indietro, ogni ostacolo mi ha reso migliore"],
      ["assistant", "Questa è una riflessione potente. Hai cresciuto anche le tue soft skills, non solo quelle tecniche. Come festeggi?"],
      ["user", "Cena fuori con Luca e Sara stasera!"],
      ["assistant", "Meriti tutti i festeggiamenti! Goditi la serata e assapora questo traguardo. 🎉"],
    ],
    facts: [
      { type: "event", content: "Progetto cliente consegnato con successo, possibile fase 2 in discussione", tags: ["lavoro", "successo", "milestone"] },
      { type: "emotion", content: "Forte senso di orgoglio e crescita guardando il percorso del progetto", tags: ["crescita", "soddisfazione"] },
    ],
  },
  {
    daysAgo: 3,
    mood: 67,
    keywords: ["transizione", "riflessione", "pausa"],
    summary:
      "Dopo la consegna del progetto, Francesco si sente in uno stato di transizione. Non ha ancora un nuovo progetto principale e si chiede su cosa concentrarsi. Riflette sul bisogno di prendersi una pausa prima di buttarsi nel prossimo impegno.",
    messages: [
      ["user", "Post-consegna un po' strano, non so bene cosa fare adesso"],
      ["assistant", "Il vuoto dopo un grande traguardo è normale. Come stai vivendo questa pausa?"],
      ["user", "Un po' spaesato, sono abituato ad avere urgenze. Ma forse ne ho bisogno"],
      ["assistant", "Hai lavorato intensamente per settimane. Cosa ti piacerebbe fare con questo tempo?"],
      ["user", "Forse dedicarmi al side project senza pressione, e riprendere la corsa domani"],
      ["assistant", "Perfetto: creatività senza deadline e movimento. Goditela! 🌤️"],
    ],
    facts: [
      { type: "emotion", content: "Si sente spaesato nel periodo di transizione tra progetti", tags: ["lavoro", "transizione"] },
      { type: "event", content: "Vuole riprendere la corsa domani, schiena guarita", reference_date: 2, tags: ["sport", "corsa"] },
    ],
  },
  {
    daysAgo: 2,
    mood: 77,
    keywords: ["libertà", "corsa", "ritorno"],
    summary:
      "Francesco ha ripreso a correre dopo la pausa forzata per la schiena. Non ha forzato i tempi ma si è goduto il movimento. Si sente libero e grato. Ha anche lavorato al side project con risultati promettenti.",
    messages: [
      ["user", "Ho ripreso a correre! Non ho forzato ma che bello muoversi di nuovo"],
      ["assistant", "Finalmente! Mi avevi detto ieri che volevi riprendere. Come sta la schiena?"],
      ["user", "Perfetta, gli esercizi del fisio hanno funzionato alla grande. Ho corso 3km easy"],
      ["assistant", "Saggio non forzare subito. Come ti sei sentito durante la corsa?"],
      ["user", "Libero, felice. Ho anche lavorato al side project dopo, il prototipo migliora"],
      ["assistant", "Corsa + creatività, la combo perfetta. Bentornato in pista! 🏃‍♂️"],
    ],
    facts: [
      { type: "event", content: "Ripreso a correre dopo pausa per schiena, 3km easy senza problemi", tags: ["sport", "corsa", "ripresa"] },
      { type: "event", content: "Side project AI progredisce, prototipo in miglioramento", tags: ["side-project", "ai"] },
    ],
  },
  {
    daysAgo: 1,
    mood: 72,
    keywords: ["normalità", "gratitudine", "equilibrio"],
    summary:
      "Giornata equilibrata e serena. Francesco sente di aver trovato un buon ritmo tra lavoro, sport, meditazione e creatività. Riflette sul mese passato e su quanto sia cresciuto. Si sente grato per il percorso fatto.",
    messages: [
      ["user", "Giornata tranquilla e bella. Meditazione, lavoro, stretching, side project"],
      ["assistant", "Una giornata completa! Sembra che tu abbia trovato un buon equilibrio. Come ti senti guardando l'ultimo mese?"],
      ["user", "Cresciuto. Ho gestito stress, conflitti, momenti di solitudine, e ne sono uscito meglio"],
      ["assistant", "Questa consapevolezza è preziosa. Cosa ti ha aiutato di più in questo percorso?"],
      ["user", "La costanza nelle piccole cose: meditazione, corsa, journaling. E le persone intorno a me"],
      ["assistant", "Abitudini + relazioni = una base solida. Continua così, sei sulla strada giusta! 🌟"],
    ],
    facts: [
      { type: "insight", content: "La costanza nelle piccole abitudini quotidiane è la chiave del suo benessere", tags: ["crescita", "abitudini"] },
      { type: "theme", content: "Ha trovato equilibrio tra lavoro, sport, meditazione e creatività", tags: ["equilibrio", "benessere"] },
    ],
  },
];

async function seed() {
  const today = new Date("2026-04-11");

  // Delete existing data for this user (except user record)
  await sql`DELETE FROM facts WHERE user_id = ${USER_ID}`;
  await sql`DELETE FROM messages WHERE session_id IN (SELECT id FROM sessions WHERE user_id = ${USER_ID})`;
  await sql`DELETE FROM sessions WHERE user_id = ${USER_ID}`;
  console.log("Cleaned existing data");

  for (const day of days) {
    const date = new Date(today);
    date.setDate(date.getDate() - day.daysAgo);
    const dateStr = date.toISOString().split("T")[0];

    // Create session
    const [session] = await sql`
      INSERT INTO sessions (user_id, date, summary, mood_score, mood_keywords, created_at)
      VALUES (${USER_ID}, ${dateStr}, ${day.summary}, ${day.mood}, ${day.keywords}, ${dateStr}::timestamp + interval '20 hours')
      RETURNING id
    `;
    console.log(`Session ${dateStr} (mood: ${day.mood}) -> ${session.id}`);

    // Build transcript from messages
    const transcript = day.messages
      .map(([role, content]) => `${role === "user" ? "Utente" : "Jurnal"}: ${content}`)
      .join("\n\n");

    await sql`UPDATE sessions SET transcript = ${transcript} WHERE id = ${session.id}`;

    // Insert messages
    for (let i = 0; i < day.messages.length; i++) {
      const [role, content] = day.messages[i];
      const msgTime = new Date(date);
      msgTime.setHours(20, i * 2, 0);
      await sql`
        INSERT INTO messages (session_id, role, content, created_at)
        VALUES (${session.id}, ${role}, ${content}, ${msgTime.toISOString()})
      `;
    }

    // Insert facts
    for (const fact of day.facts) {
      let refDate = null;
      if (fact.reference_date) {
        if (fact.reference_date > 0) {
          // days ago
          const rd = new Date(today);
          rd.setDate(rd.getDate() - fact.reference_date);
          refDate = rd.toISOString().split("T")[0];
        } else {
          // negative = days from today into the future
          const rd = new Date(today);
          rd.setDate(rd.getDate() - fact.reference_date);
          refDate = rd.toISOString().split("T")[0];
        }
      }
      await sql`
        INSERT INTO facts (user_id, session_id, type, content, reference_date, tags, status, created_at)
        VALUES (
          ${USER_ID}, ${session.id}, ${fact.type}::fact_type, ${fact.content},
          ${refDate}, ${fact.tags},
          ${refDate && new Date(refDate) < today ? "followed_up" : "active"}::fact_status,
          ${dateStr}::timestamp + interval '20 hours 30 minutes'
        )
      `;
    }
  }

  // Verify
  const [count] = await sql`SELECT COUNT(*) as c FROM sessions WHERE user_id = ${USER_ID}`;
  const [msgCount] = await sql`SELECT COUNT(*) as c FROM messages WHERE session_id IN (SELECT id FROM sessions WHERE user_id = ${USER_ID})`;
  const [factCount] = await sql`SELECT COUNT(*) as c FROM facts WHERE user_id = ${USER_ID}`;
  console.log(`\nDone! ${count.c} sessions, ${msgCount.c} messages, ${factCount.c} facts`);
}

seed().catch(console.error);
