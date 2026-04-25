# 1.0.0 (2026-04-25)


### Bug Fixes

* center all pages at 75vw, home page fully centered, favicon in sidebar ([5f44c60](https://github.com/jurnal-org/artifact/commit/5f44c609ed538d0f53b3842c87b5988956445239))
* drop UNIQUE(user_id, date) constraint to allow multiple sessions per day ([ba820da](https://github.com/jurnal-org/artifact/commit/ba820daeb57df3b111998d2f8a35bcb6fbc18d45))
* full-width desktop layout, sidebar logo, and trend delta KPI ([a66b21b](https://github.com/jurnal-org/artifact/commit/a66b21b2883f739111f34dfb23a408a90ec48299))
* **history:** center timeline dots vertically and increase date font size ([e037d8b](https://github.com/jurnal-org/artifact/commit/e037d8bbfa01767e1f46be9d8da249dc9c41b5c8))
* improve aurora background quality with radial gradients and lower intensity ([2548308](https://github.com/jurnal-org/artifact/commit/25483088a0aab297fc2c66503748696836d0191a))
* make entire UI fully responsive across mobile, tablet, and desktop ([8b93536](https://github.com/jurnal-org/artifact/commit/8b93536bf32832d42dcb719ba294dc6f4ddf21c0))
* make mic button clickable with loading feedback, enhance aurora background ([64294cc](https://github.com/jurnal-org/artifact/commit/64294cc7ed60c3b553a869243b576346ff86849b))
* remove misleading progress dots and polish session header/exit dialog ([4864b40](https://github.com/jurnal-org/artifact/commit/4864b40ab6c20b23d53b4801c387eff86d92e8ab))
* separate greeting/title from mic on home page, larger greeting and mic ([553500e](https://github.com/jurnal-org/artifact/commit/553500e7b3eddb46860a7794223f02eb2bf5a949))
* **session:** hide mobile pill nav during session to unblock mic button ([5412a16](https://github.com/jurnal-org/artifact/commit/5412a1672318ef1ceb5eec2be1c2171fc1d53d36))
* shift mic section higher on desktop home page ([db84a07](https://github.com/jurnal-org/artifact/commit/db84a078211c5f524df7326b6aa59444bbdcaa0b))
* style session exit dialog to match platform dark aurora aesthetic ([1038014](https://github.com/jurnal-org/artifact/commit/10380140e05276fc2d8eb123a87b3909c6a9f6bf))
* use correct Gemini model names (gemini-3-flash-preview, gemini-embedding-2-preview) ([b13075f](https://github.com/jurnal-org/artifact/commit/b13075fea96478281865b7240489ab275b1227f0))


### Features

* add API routes for briefing, sessions, and history ([cd9a073](https://github.com/jurnal-org/artifact/commit/cd9a07320c50fb51b60d961ab41d8e41d2ba3193))
* add dashboard API route with mood trends and keywords ([e7cf88c](https://github.com/jurnal-org/artifact/commit/e7cf88c8304fac7404f7c36f1923b3f02b7f966c))
* add database schema, Neon client, and TypeScript types ([a612eff](https://github.com/jurnal-org/artifact/commit/a612effa89f5d6b3c8dd8115a91050b067e9bb09))
* add Gemini AI client, embeddings, and system prompts ([5c23944](https://github.com/jurnal-org/artifact/commit/5c23944dc21a24ad7a1d357a6b9dc314ca274785))
* add Google auth with NextAuth.js ([a03c224](https://github.com/jurnal-org/artifact/commit/a03c224d7dc6803a87123c4293c54a96eb88de04))
* add history and dashboard pages with mood chart and keyword cloud ([413e2c5](https://github.com/jurnal-org/artifact/commit/413e2c51c0085d50e67679f54eb5a901ea7655e1))
* add home page and active session page ([ba2b63f](https://github.com/jurnal-org/artifact/commit/ba2b63fbb62ac109f1cb931358318214995dcfb3))
* add message handling and session closure API routes ([4f1dc01](https://github.com/jurnal-org/artifact/commit/4f1dc01c506548836ec08c5fa9b6832d6d837c4c))
* add shared UI components (aurora, nav, mood, chat, indicators) ([dd924f5](https://github.com/jurnal-org/artifact/commit/dd924f55b2970122685fd198780c761cf02663a2))
* add voice recorder, session chat hook, and STT token route ([5783bde](https://github.com/jurnal-org/artifact/commit/5783bde26beca2dae3c9f8a6c3efbe05fface309))
* allow multiple journal sessions per day ([da9f2ce](https://github.com/jurnal-org/artifact/commit/da9f2ce79c67424f50428c7f1b58799e5446adba))
* enhance AI memory, adaptive session length, and session restore ([1873ae2](https://github.com/jurnal-org/artifact/commit/1873ae29eab6aa5f83190ef3ede68a177731a399))
* final integration and polish ([b8bb6b8](https://github.com/jurnal-org/artifact/commit/b8bb6b8f7044e80be9f616639a703484d8f12959))
* **history:** hide chat transcript behind 'Esplora chat' toggle button ([aef946e](https://github.com/jurnal-org/artifact/commit/aef946e91df9a49394e211fa71f89c155958ff48))
* **history:** increase font sizes on desktop for better readability ([0352d6c](https://github.com/jurnal-org/artifact/commit/0352d6ca6b13f73d35c43accafca0c190f5a100a))
* **history:** make back-to-history button more visible and elegant ([a383e6f](https://github.com/jurnal-org/artifact/commit/a383e6f2b9954fe63c1330a89a5e0006f1107457))
* **history:** replace 'La tua giornata' heading with formatted date ([e280daa](https://github.com/jurnal-org/artifact/commit/e280daa0940387cc576d2c19d6af4d544878413f))
* persistent mic button and unified daily summary across sessions ([396c9f7](https://github.com/jurnal-org/artifact/commit/396c9f7f10bb707e54885d9313687c40733fafd1))
* **prompts:** increase minimum summary length and emotional depth ([f869f4e](https://github.com/jurnal-org/artifact/commit/f869f4ec4170917b6e3bf839f13030d48fd7efdd))
* redesign UI with liquid glass aesthetic and responsive sidebar nav ([82ccef6](https://github.com/jurnal-org/artifact/commit/82ccef68ceb75400e0c79fbeb1935b9bf5188836))
* scaffold Next.js project with dependencies and theme ([6bb168e](https://github.com/jurnal-org/artifact/commit/6bb168e110d1deff934c14c16d3065c6cce6650a))
* session exit dialog, persistent mic, serif font, first-person summaries ([3c545ab](https://github.com/jurnal-org/artifact/commit/3c545ab44392a6a93dcd8124c58311c4725a41a4))
