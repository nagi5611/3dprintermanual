// Q&A ページ用のサンプルデータ（デザイン確認用。内部システム側で差し替える）
// cat はガイドの章 id（../index.html#rules など）に対応
// machine: 'ke' | 'cc' | 'both'
// status: 'answered'（回答済み） | 'open'（未回答）
// answers[].by は担当生徒（金田・田村・藤原）のみ。role は '担当生徒' 固定。
// 質問者自身の追記（お礼など）は role: '質問者' で残す

const QA_CATS = [
  { id: 'rules',    no: '01', title: '利用ルール' },
  { id: 'model',    no: '02', title: '3Dデータを用意する' },
  { id: 'slice',    no: '03', title: '印刷データを作成する' },
  { id: 'filament', no: '04', title: 'フィラメントを取り付ける' },
  { id: 'print',    no: '05', title: '印刷を開始する' },
  { id: 'finish',   no: '06', title: '印刷完了後の手順' },
  { id: 'trouble',  no: '07', title: 'トラブルシューティング' },
];

const QA_MACHINES = { ke: 'Ender-3 V3 KE', cc: 'Centauri Carbon', both: '両機種' };

const QA_ITEMS = [
  {
    id: 12, cat: 'slice', machine: 'ke', status: 'answered', pinned: true,
    title: 'サポートはどんなときにオンにすればいいですか？',
    body: '設定を確認するステップで「張り出し部分があるときはサポート」とありますが、どのくらいの角度から必要なのかがわかりません。',
    author: '1年', date: '2026-09-28',
    answers: [
      { by: '金田', role: '担当生徒', date: '2026-09-28', text: '目安は垂直から45°以上傾いている部分です。それより緩やかならサポートなしでもきれいに出ます。スライサーのプレビューで赤く表示される部分があればオンにしてください。' },
    ],
  },
  {
    id: 11, cat: 'model', machine: 'both', status: 'open',
    title: 'Blender で作ったモデルの大きさが、スライサーで開くと小さくなります',
    body: 'Blender では 5cm くらいで作ったのに、Creality Print で開くと 0.05mm と表示されます。どこを直せばいいですか？',
    author: '2年', date: '2026-09-27',
    answers: [],
  },
  {
    id: 10, cat: 'rules', machine: 'both', status: 'answered',
    title: '放課後に予約していない時間でも使えますか？',
    body: '予約カレンダーが空いていれば、その場で使っても大丈夫ですか？',
    author: '1年', date: '2026-09-25',
    answers: [
      { by: '金田', role: '担当生徒', date: '2026-09-25', text: '必ず ScienceHUB で予約してから使ってください。空いていても、予約が承認されるまでは印刷を始めないでください。' },
    ],
  },
  {
    id: 9, cat: 'filament', machine: 'cc', status: 'answered',
    title: 'アンロードを押しても、フィラメントが抜けてきません',
    body: '画面の指示どおりにアンロードしましたが、途中で止まってしまいます。',
    author: '1年', date: '2026-09-22',
    answers: [
      { by: '田村', role: '担当生徒', date: '2026-09-22', text: 'ノズルが十分に温まる前に引っぱると止まりやすいです。温度表示が 200℃ を超えてから、もう一度アンロードしてみてください。それでも抜けない場合は無理に引かず、部員か先生を呼んでください。' },
      { by: '1年', role: '質問者', date: '2026-09-23', text: '温度が上がるまで待ったら抜けました。ありがとうございます。' },
    ],
  },
  {
    id: 8, cat: 'trouble', machine: 'ke', status: 'answered',
    title: '1層目がベッドにくっつかず、毎回はがれてしまいます',
    body: 'プレートは IPA で拭きました。それでも角からはがれてきます。',
    author: '2年', date: '2026-09-19',
    answers: [
      { by: '藤原', role: '担当生徒', date: '2026-09-19', text: 'スライサーで「ブリム」をオンにして接地面を広げてみてください。それでも直らない場合はベッドのレベリングがずれている可能性があるので、班員に声をかけてください。' },
    ],
  },
  {
    id: 7, cat: 'print', machine: 'cc', status: 'open',
    title: '内蔵カメラの映像は、学校のPC以外からも見られますか？',
    body: '長時間の印刷で様子を確認したいです。スマホから見る方法はありますか？',
    author: '1年', date: '2026-09-18',
    answers: [],
  },
  {
    id: 6, cat: 'finish', machine: 'both', status: 'answered',
    title: '印刷に失敗した作品やサポート材は、どこに捨てればいいですか？',
    body: '',
    author: '1年', date: '2026-09-15',
    answers: [
      { by: '金田', role: '担当生徒', date: '2026-09-15', text: '物理実験室の「PLAくず」と書かれた箱に入れてください。普通のゴミ箱には捨てないでください。' },
    ],
  },
];
