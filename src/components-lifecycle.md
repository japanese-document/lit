{ "header": {"name": "コンポーネント", "order": 0}, "order": 4 }
---
# ライフサイクル

LitコンポーネントはWeb標準であるcustom elementsのライフサイクルメソッドを使っています。
更にLitはリアクティブプロパティが変更された時にDOMにそれを反映するリアクティブアップデートサイクルを追加しています。

## custom elementsのライフサイクル

Litコンポーネントはcustom elementsです。そして、custom elementsのライフサイクルメソッドを継承しています。
custom elementsのライフサイクルの詳しい情報は[Using the lifecycle callbacks](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#using_the_lifecycle_callbacks)を見てください。

コンポーネントでcustom elementsのライフサイクルメソッドをオーバーライドする場合、
Litが正常に動作するために、そのメソッド内でそれに該当する`super`のメソッド(例: `super.connectedCallback()`)を実行しなければなりません。

### constructor()

custom elements(Litコンポーネント)が生成される時に実行されます。
既にDOMにcustom elementsが存在していてcustom elements(Litコンポーネント)の定義がロードされた時(アップグレードされた時)も実行されます。

#### Litの動作

`requestUpdate()`メソッドを実行して非同期更新をリクエストします。
そうすることでLitコンポーネントにアップグレードされた時にすぐに更新されます。

要素の既存のプロパティを保存します。
これによって要素にセットされたプロパティの値が保持されます。そして、コンポーネントのデフォルトの値をそれで上書きすることができます。

#### ユースケース

最初の[更新](#リアクティブアップデートサイクル)の前に1回だけ実行する必要がある初期化処理を実行です。
例えば、デコレータを使わない場合、[`static properties`クラスフィールドを使います](https://japanese-document.github.io/lit/components-properties.html#パブリックプロパティとインターナルステート)。
その場合、constructor()内でデフォルトの値をセットします。

```js
constructor() {
  super();
  this.foo = 'foo';
  this.bar = 'bar';
}
```

### connectedCallback()

コンポーネントがdocumentに接続された(追加された)時に実行されます。

#### Litの動作

要素がdocumentに接続された後、Litはアップデートサイクルの一番目の処理を開始します。
レンダリングをする前にLitは`renderRoot`(通常は`shadowRoot`)が生成済みか確認します。

1回でも要素がドキュメントに接続すると、コンポーネントの更新は接続状態に関係なく進みます。

#### ユースケース

`connectedCallback()`には要素がdocumentに接続した時のみ実行したい処理を記述します。
それの最も一般的なケースは要素の外部のNodeにイベントリスナを追加することです。例えばkeydownイベントハンドラをwindowに追加することです。
通常、要素がdocumentから切断された時は`connectedCallback()`で加えた何かを元に戻す必要があります。例えば、メモリーリークを防止するためにwindowに登録したイベントリスナを削除することです。

```js
connectedCallback() {
  super.connectedCallback()
  addEventListener('keydown', this._handleKeydown);
}
```

### disconnectedCallback()

コンポーネントがdocumentのDOMツリーから削除されたら実行されます。

#### Litの動作

[リアクティブアップデートサイクル](#リアクティブアップデートサイクル)を一時停止します。 要素が接続されたら再開します。

#### ユースケース

このコールバックが実行されることは要素が今後使われないかもしれないことを示しています。
ガベージコレクションで要素を解放するために、
`disconnectedCallback()`では要素への参照を保持している物(例えば要素を参照している外部のNodeに加えられたイベントリスナ)がないか確認する必要があります。
例えば、`window`に追加されたkeydownイベントハンドラのように要素の外部のNodeからイベントリスナを削除します。
要素がDOMツリー内を移動したりキャッシュされることによって、非接続になった後に再度接続することがあります。
このため正常に動作するためにそのような参照もしくはイベントリスナは`connectedCallback()`で再度セットする必要があります。

```js
disconnectedCallback() {
  super.disconnectedCallback()
  window.removeEventListener('keydown', this._handleKeydown);
}
```

コンポーネント内のDOMに加えられた(テンプレート内で宣言的に加えられた物も含む)イベントリスナを削除する必要はありません。
外部のNodeに追加されたイベントリスナとは違って、それはコンポーネントのガベージコレクションを妨げません。

### attributeChangedCallback()

要素の[observedAttributes](https://japanese-document.github.io/lit/api-LitElement.html#static_observedAttributes__Array)が1つでも変更された時に実行されます。

#### Litの動作

Litはこのコールバックを属性の変更をリアクティブプロパティに同期することに使います。
それは属性に値がセットされるとそれに対応するプロパティに値がセットされます。
Litは自動的に要素の`observedAttributes`とコンポーネントのリアクティブプロパティがそれぞれ対応するようにします。

#### ユースケース

このコールバックを実装する機会はほどんどありません。

### adoptedCallback()

コンポーネントが別のdocumentに移動したときに実行されます。

`adoptedCallback`はPolyfillにはないことに注意してください。

#### Litの動作

デフォルトではLitはこのコールバックで何もしません。

#### ユースケース

このコールバックはdocumentを移動した時に要素の動作を変更するような高度なユースケースに使われます。

## リアクティブアップデートサイクル

LitコンポーネントはWeb標準のcustom elementsのライフサイクルに加えてリアクティブアップデートサイクルを用意しています。

リアクティブアップデートサイクルはリアクティブプロパティが変更された時もしくは`requestUpdate()`メソッドが明示的に実行された時に発動します。
Litは更新を非同期で行います。そして、プロパティの変更の反映はまとめて行われます。
つまり、更新をリクエストした後に複数のプロパティが変更された場合、更新が始まる前だったら、すべての変更は同じ更新で反映されます。

更新はmicrotaskのタイミング(ブラウザが次のフレームを画面に描画する前)で行われます。
microtaskの説明は[Jake Archibaldの記事](https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/)を見てください。

端的に言うとリアクティブプロパティは下記のようになります。

1. 1つ以上のプロパティが変更された時もしくは`requestUpdate()`が実行された時、更新がスケジュールされます。
1. 次のフレームが描画される前に更新が実行されます。
    1. コンポーネントのプロパティが要素の属性に反映されます。
    1. コンポーネント内のDOMを更新するためにrenderメソッドが実行されます。
1. 更新が完了します。そして、`updateComplete`のPromiseが`resolve`されます。

詳細は下記のようになります。

**更新前**

![update-1](images/components-update-1.jpg)

![update-2](images/components-update-2.jpg)

**更新**

![update-3](images/components-update-3.jpg)

**更新後**

![update-4](images/components-update-4.jpg)

### changedProperties

多くのリアクティブアップデートサイクルのメソッドは変更済みのプロパティを`Map`に格納した引数(`changedProperties`)として受け取ります。
`Map`のキーはプロパティ名です。そして、その値は1つ前のプロパティの値です。
現行のプロパティの値は`this.property`もしくは`this[property]`で取得することができます。

#### changedPropertiesの型

TypeScriptで`changedProperties`に対して厳格な型チェックをしたい場合は`PropertyValues<this>`を使います。これは各プロパティ名に対して正確な型を推論します。

```ts
import {LitElement, html, PropertyValues} from 'lit';
...
  shouldUpdate(changedProperties: PropertyValues<this>) {
    ...
  }
```

厳格な型が必要ないなら(プロパティ名だけチェックして1つ前の値はチェックしない)、`Map<string, any>`のような緩い型を使うこともできます。

`PropertyValues<this>`は`protected`と`private`なプロパティを認識しません。
`protected`と`private`なプロパティをチェックしたい場合は`Map<string, any>`のような緩い型を使います。

#### 更新中のプロパティの変更

更新中(`render()`メソッド完了まで)にプロパティを変更すると`changedProperties`は変更されますが、新たなアップデートサイクルを発動しません。
`render()`メソッドの後(例: `updated()`内)でプロパティを変更した場合は新たなアップデートサイクルを発動します。
そして、変更されたプロパティは新たな`changedProperties`に反映されて次のアップデートサイクルで使われます。

### 更新の発動

リアクティブプロパティが変更される、もしくは`requestUpdate()`を実行すると更新が発動されます。
更新は非同期で実行されるので、
更新が実行される前に生じた変更はまとめて1回の更新で反映されます。

#### hasChanged()

リアクティブプロパティに値がセットされた時に実行されます。
デフォルトでは`hasChanged()`は`!==`で比較します。そして、`true`を返した場合、更新がスケジュールされます。
詳しくは[`hasChanged()`](https://japanese-document.github.io/lit/components-properties.html#hasChanged)を見てください。

#### requestUpdate()

`requestUpdate()`を実行すると明示的に更新をスケジュールすることができます。
これはプロパティの変更によらずに要素を更新してレンダリングしたい場合に使います。
例えば、タイマーコンポーネントは1秒ごとに`requestUpdate()`を実行します。

```js
connectedCallback() {
  super.connectedCallback();
  this._timerInterval = setInterval(() => this.requestUpdate(), 1000);
}

disconnectedCallback() {
  super.disconnectedCallback();
  clearInterval(this._timerInterval);
}
```

変更されたプロパティのリストは`changedProperties` Mapに格納されます。それはこの後に実行されるライフサイクルメソッドに渡されます。
そのMapのキーはプロパティ名です。そして、その値はひとつ前のプロパティの値です。

`requestUpdate()`を実行する時にプロパティ名とその1つ前の値を渡すことでそれを`changedProperties` Mapに格納することができます。
これはカスタムゲッタやセッタを実装する際に使います。
カスタムゲッタやセッタに関する詳しい情報は[リアクティブプロパティ](https://japanese-document.github.io/lit/components-properties.html)を見てください。

```js
  this.requestUpdate('state', this._previousState);
```

### 更新の実行

`performUpdate()`が更新を実行します。このメソッド内で複数のライフサイクルが実行されます。

これは更新処理中にプロパティの値の計算を可能にするために、
通常はコンポーネントの更新中に更新を発動する変更は新しい更新をスケジュールしません。
更新中に変更されたプロパティは`changedProperties` Mapに反映されます。だから、その後のライフサイクルメソッドは変更を反映した処理を行うことができます。

#### shouldUpdate()

更新を実行するかどうか判断するために実行されます。

| | |
|-|-|
| 引数 | `changedProperties`: 変更されたプロパティ名をキーに持ち、その1つ前の値を値に持つ`Map` |
| 更新は発動するか | いいえ、このメソッド内でのプロパティの変更は要素の更新を発動しません。 |
| superを実行する必要があるか | いいえ |
| サーバで実行されるか | いいえ |

`shouldUpdate()`が`true`を返した場合(これがデフォルト)、更新が実行されます。
`false`を返した場合は残りのアップデートサイクルは実行されませんが`updateComplete`のPromiseはresolveされます。

`shouldUpdate()`を実装すれば特定のプロパティが変更されたときのみ更新が発動するようにすることができます。
現在の値と1つ前の値との比較は`changedProperties`を使います。

```ts
shouldUpdate(changedProperties: Map<string, any>) {
  // prop1が変更された場合のみ更新されます。
  return changedProperties.has('prop1'); 
}
```

#### willUpdate()

`update()`を実行する前に実行されます。更新で使用する値を生成する用途に使います。

| | |
|-|-|
| 引数 | `changedProperties`: 変更されたプロパティ名をキーに持ち、その1つ前の値を値に持つ`Map` |
| 更新は発動するか | いいえ、このメソッド内でのプロパティの変更は要素の更新を発動しません。 |
| superを実行する必要があるか | いいえ |
| サーバで実行されるか | はい |

残りの更新プロセスで使われるプロパティの値を他のプロパティを使って生成する処理を`willUpdate()`に実装します。

```ts
willUpdate(changedProperties: PropertyValues<this>) {
  // 必要な時だけ高コストな処理を実行するために変更されたプロパティを確認します。
  if (changedProperties.has('firstName') || changedProperties.has('lastName')) {
    this.sha = computeSHA(`${this.firstName} ${this.lastName}`);
  }
}

render() {
  return html`SHA: ${this.sha}`;
}
```

#### update()

コンポーネントのDOMを更新するために実行されます。

| | |
|-|-|
| 引数 | `changedProperties`: 変更されたプロパティ名をキーに持ち、その1つ前の値を値に持つ`Map` |
| 更新は発動するか | いいえ、このメソッド内でのプロパティの変更は要素の更新を発動しません。 |
| superを実行する必要があるか | はい、実行しない場合、要素の属性とテンプレートは更新されません。 |
| サーバで実行されるか | いいえ |

プロパティの値を要素の属性に反映します。そして、`render()`でコンポーネント内のDOMを更新します。

通常、このメソッドを実装することはありません。

#### render()

`render()`は`update()`内で実行されます。
`render()`はコンポーネントのDOMとしてレンダリングできる値(例: `TemplateResult`)を返すように実装する必要があります。

| | |
|-|-|
| 引数 | なし |
| 更新は発動するか | いいえ、このメソッド内でのプロパティの変更は要素の更新を発動しません。 |
| superを実行する必要があるか | いいえ |
| サーバで実行されるか | はい |

`render()`は引数を取りません。
通常はコンポーネントのプロパティを使います。
詳しくは[レンダリング](https://japanese-document.github.io/lit/components-rendering.html)を見てください。

```js
render() {
  const header = `<header>${this.header}</header>`;
  const content = `<section>${this.content}</section>`;
  return html`${header}${content}`;
}
```

### 更新の完了 

変更をコンポーネントのDOMにレンダリングするために`update()`を実行した後、以下のメソッドを使ってコンポーネントのDOMを操作することができます。

#### firstUpdated()

初回のコンポーネントのDOMの更新後、[`updated()`](#updated)が実行される直前に実行されます。

| | |
|-|-|
| 引数 | `changedProperties`: 変更されたプロパティ名をキーに持ち、その1つ前の値を値に持つ`Map` |
| 更新は発動するか | はい、このメソッド内でプロパティが変更されると新たにアップデートサイクルがスケジュールされます。 |
| superを実行する必要があるか | いいえ |
| サーバで実行されるか | いいえ |

`firstUpdated()`には初回にコンポーネントのDOMが生成された後に１回だけ実行したい処理を実装します。
例えば、下記のようにレンダリングされた要素にfocusを当てる処理や、要素に[ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver)もしくは[IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver)を加える処理です。

```js
firstUpdated() {
  this.renderRoot.getElementById('my-text-area').focus();
}
```

#### updated()

コンポーネントの更新が終了して要素のDOMの更新とレンダリングがされる毎に実行されます。

| | |
|-|-|
| 引数 | `changedProperties`: 変更されたプロパティ名をキーに持ち、その1つ前の値を値に持つ`Map` |
| 更新は発動するか | はい、このメソッド内でプロパティが変更されると新たにアップデートサイクルがスケジュールされます。 |
| superを実行する必要があるか | いいえ |
| サーバで実行されるか | いいえ |

更新の後に要素を使う処理は`updated()`に実装します。
例えば、アニメーションを実行するコードでは要素の大きさを計測する必要があるかもしれません。

```ts
updated(changedProperties: Map<string, any>) {
  if (changedProperties.has('collapsed')) {
    this._measureDOM();
  }
}
```

#### updateComplete

`updateComplete`はPromiseです。これは更新が終了した時に解決されます。
`updateComplete`は更新の終了を待つために使います。
解決した値は要素の更新が終了したかどうかを示すbooleanです。
それが`true`ならアップデートサイクルが終了した後に待機している更新はありません。

要素の更新は、その子要素の更新を引き起こす場合があります。
デフォルトではその要素の更新が完了すると`updateComplete` Promiseは解決しますが、その要素の子要素の更新が完了するまで待ちません。
この動作は[`getUpdateComplete()`](#getUpdateComplete())をオーバーライドすることで変更することができます。

下記はコンポーネントの更新が完了することが必要な処理の例です。

1. **テスト**
テストを書く時、コンポーネントのDOMをassertする前に`updateComplete` Promiseを`await`します。
しかし、assertする段階でコンポーネントの子孫要素全体の更新が完了している必要がある場合、通常は`requestAnimationFrame`コールバックを使うことを推奨します。
理由はLitのデフォルトのスケジューリングがブラウザのmicrotaskキューを使っているからです。microtaskキューはanimation frameの前に空になります。
これによって、ページ内で待機しているすべてのLitの更新が`requestAnimationFrame`コールバックより前で完了します。

2. **測定** 
目的のレイアウトにするためにコンポーネントのDOMサイズを測定する必要があるかもしれません。
レイアウトはJavaScriptを使わずにCSSのみで実装する方が好ましいですが、CSSの制限のために使わざるを得ない場合があります。
LitやReactiveElementのコンポーネントを測定する際は、ステートを変更した後かつ測定する前に`updateComplete`をawaitすることで解決できるかもしれません。
この方法で充分かもしれませんが、`updateComplete`は子孫要素全体の更新が完了を待ちません。
だから、レイアウトが変更された時により確実に測定する処理を実行する方法として[`ResizeObserver`](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver)を使う方法を推奨します。

3. **イベント**
レンダリングを完了した後、コンポーネントからイベントをdispatchすることを推奨します。
そうするとイベントリスナはコンポーネントが完全にレンダリングされたかどうか知ることができます。
下記のようにイベントをdispatchする前に`updateComplete` Promiseをawaitします。

    ```js
    async _loginClickHandler() {
      this.loggedIn = true;
      // loggedInステートがレンダリングされてDOMに反映されるまで待ちます。
      await this.updateComplete;
      this.dispatchEvent(new Event('login'));
    }
    ```

アップデートサイクル中に未処理のエラーがある場合、`updateComplete` Promiseはrejectします。
詳しくは[アップデートサイクル中のエラーを取り扱う](#アップデートサイクル中のエラーを取り扱う)を見てください。

### アップデートサイクル中のエラーを取り扱う

`render()`や`update()`のようなライフサイクルメソッド内でcatchされない例外が発生は`updateComplete` Promiseのrejectを引き起します。
ライフサイクルメソッド内のコードで例外がthrowされる可能性がある場合、それを`try`/`catch`ステートメントで囲むと良いでしょう。


`updateComplete` Promiseをawaitする時はそれを`try`/`catch`ステートメントで囲むと良いでしょう。

```js
try {
  await this.updateComplete;
} catch (e) {
  /* エラーを取り扱う */
}
```

予期しない所でコードがthrowする場合があります。
すべてのthrowに対応するために、`window.onunhandledrejection`にハンドラをセットします。
例えば再現することが難しい問題を切り分けるためにバックエンドサービスにエラーレポートを送信するために使います。

```js
window.onunhandledrejection = function(e) {
  /* エラーを取り扱う */
}
```

### その他のライフサイクルメソッドを変更する

このセクションでは余り変更することがないライフサイクルメソッドを紹介します。

#### scheduleUpdate()

`scheduleUpdate()`をオーバーライドすると更新するタイミングを変更することができます。
`scheduleUpdate()`は更新が実行される直前に実行されます。デフォルトではすぐに`performUpdate()`を実行します。
`scheduleUpdate()`をオーバーライドすることで更新の実行を延期することができます。
これをすることによって更新がメインのレンダリング/イベントスレッドをブロックすることを防ぎます。
下記のコードは次のフレームの描画の後に更新をスケジュールします。これで更新処理が高コストな場合、[Jank](https://developer.mozilla.org/en-US/docs/Glossary/Jank)を削減することができます。

```ts
protected override async scheduleUpdate(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve));
  super.scheduleUpdate();
}
```

`scheduleUpdate()`をオーバーライドする場合、上記のように保留中の更新を実行するために`super.scheduleUpdate()`を実行する必要があります。

#### performUpdate()

`performUpdate()`には`shouldUpdate()`、`update()`、`updated()`を実行してリアクティブアップデートサイクルを実行する処理を実装します。

`performUpdate()`を実行すると保留中の更新をすぐに実行することができます。
通常これを使うことはありませんが、同期的に更新を行いたい場合に使います。
(保留中の更新がない場合、`requestUpdate()`を実行して`performUpdate()`が実行されることで同期的な更新を強制することができます。)

#### hasUpdated

1回以上コンポーネントが更新されている場合、`hasUpdated`プロパティはtrueを返します。
`hasUpdated`はライフサイクルメソッド内でコンポーネントが1回も更新されていない時に実行したい処理を実行したい場合に役立ちます。


#### getUpdateComplete()

`updateComplete` Promiseの完了条件を変更するには`getUpdateComplete()`をオーバーライドします。
例えば、下記のように子要素の更新をawaitすることに利用します。
最初に`super.getUpdateComplete()`をawaitして、次に処理を追加します。

```js
class MyElement extends LitElement {
  async getUpdateComplete() {
    await super.getUpdateComplete();
    await this._myChild.updateComplete;
  }
}
```

## 外部ライフサイクルフック(コントローラとデコレータ) 

コンポーネントクラスにライフサイクルメソッドを実装することに加えて、[デコレータ](https://lit.dev/docs/components/decorators/)のようにクラス外部のコードを使ってコンポーネントのライフサイクルを変更することができます。

Litは外部コードをリアクティブアップデートサイクルに統合するために2つの仕組みを提供します。
それは`static addInitializer()`と`addController()`です。

#### static addInitializer()

`addInitializer()`を使うとLitコンポーネントクラスの定義時に、そのクラスインスタンスが生成される時に実行されるコードを登録することができます。

カスタムデコレータを実装する時によく使います。
デコレータはクラスの定義される時に実行されます。そして、フィールドやメソッドの定義を置き換えることができます。
インスタンスが生成される時にそれらをする必要がある場合は`addInitializer()`を実行する必要があります。
通常はこれを利用してデコレータでコンポーネントのライフサイクルをフックするために[リアクティブコントローラ](https://japanese-document.github.io/lit/composition-controllers.html)を使います。

```ts
// TypeScriptのデコレータ
const myDecorator = (proto: ReactiveElement, key: string) => {
  const ctor = proto.constructor as typeof ReactiveElement;

  ctor.addInitializer((instance: ReactiveElement) => {
    // 要素の生成時に実行します。
    new MyController(instance);
  });
};
```

下記のように、フィールドにデコレータをセットすると各インスタンス毎にコントローラを追加するイニシャライザが実行されます。

```ts
class MyElement extends LitElement {
  @myDecorator foo;
}
```

イニシャライザはコンストラクタ毎に格納されます。
イニシャライザをサブクラスに加えてもスーパークラスには加えられません。
イニシャライザはコンストラクタで実行されるので、
イニシャライザはクラスの階層順(スーパークラスからサブクラスの順番)で実行されます。

#### addController()

コンポーネントがコントローラのライフサイクルコールバックを実行するために`addController()`はリアクティブコントローラをLitコンポーネントに追加します。
詳しくは[リアクティブコントローラ](https://japanese-document.github.io/lit/composition-controllers.html)を見てください。

#### removeController()

`removeController()`はリアクティブコントローラを削除します。そして、コンポーネントからリアクティブライフサイクルコールバックを受け取らないようにします。

## サーバーサイドリアクティブアップデートサイクル

Litの[サーバーサイドレンダリングパッケージ](https://lit.dev/docs/ssr/overview/)は現在開発中なので下記の情報は変更される可能性があります。

Litをサーバでレンダリングする時はすべてのアップデートサイクルが実行されるわけではありません。
次のメソッドはサーバで実行されます。

![update-server](images/components-update-server.jpg)

---

## License

### Japanese part

[Creative Commons Attribution-NonCommercial 4.0 International Public License](https://creativecommons.org/licenses/by-nc/4.0/legalcode)

Copyright (c) 2022 38elements

### Other

[Creative Commons Attribution 3.0 Unported](https://creativecommons.org/licenses/by/3.0/deed.en)

Copyright (c) 2020 Google LLC. All rights reserved.

BSD 3-Clause License

Copyright (c) 2020 Google LLC. All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its
   contributors may be used to endorse or promote products derived from
   this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.