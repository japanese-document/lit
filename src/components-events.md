{ "header": {"name": "コンポーネント", "order": 0}, "order": 6 }
---
# イベント

イベントは要素が変化を伝える標準的な方法です。
通常、それらの変化はユーザのインタラクションから発生します。
例えば、button要素はユーザにクリックされたときにclickイベントをdispatchします。
input要素はユーザが値を入力するとchangeイベントをdispatchします。

Litで作ったcustom elementsはこれらの自動的にdispatchされるWeb標準のイベントに加えて、カスタムイベントをdispatchすることができます。
例えば、menu要素は項目が変更されたことを示すイベントをdispatchするでしょう。
popup要素はポップアップが開いたり閉じたりするときにイベントをdispatchするでしょう。

JavaScriptのコードはイベントをリッスンしてイベントに紐づいた処理を実行することができます。
例えばtoolbar要素はメニューの項目が選択された時、リストをフィルタリングするでしょう。
login要素はログインボタンがクリックされるとログイン処理を実行するでしょう。

## イベントリスニング

LitはWeb標準の`addEventListener` APIだけでなく、宣言的な方法でも要素にイベントリスナを加えることができます。

### テンプレートでイベントリスナを加える

[Event listener expressions](https://japanese-document.github.io/lit/templates-expressions.html#Event_listener_expressions)を使うとコンポーネントのテンプレートで要素にイベントリスナを加えることができます。
この宣言的な方法で付与されるイベントリスナはテンプレートがレンダリングされる時に要素に加えられます。

#### イベントリスナのオプションを設定する

宣言的な方法で付与されるイベントリスナに(`passive`や`capture`のような)オプションを設定するには`@eventOptions`を使います。
`@eventOptions`に渡すobjectは`addEventListener`の`options`パラメータと同じ役割です。

```js
import {LitElement, html} from 'lit';
import {eventOptions} from 'lit/decorators.js';
//...
@eventOptions({passive: true})
private _handleTouchStart(e) { console.log(e.type) }
```

デコレータを使う以外にも、
[Event listener expressions](https://japanese-document.github.io/lit/templates-expressions.html#Event_listener_expressions)にobjectを渡すことで
イベントリスナのオプションを設定することができます。
その渡されるobjectは`handleEvent()`メソッドと`addEventListener()`の`options`引数のキーと値を持ちます。

```js
render() {
  return html`<button @click=${{handleEvent: () => this.onClick(), once: true}}>click</button>`
}
```

### コンポーネントもしくはshadow rootにイベントリスナを追加する

コンポーネントにWeb標準の`addEventListener`メソッドを使ってコンポーネント自身にイベントリスナを追加します。
詳しくは[EventTarget.addEventListener()](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)を見てください。

コンポーネントのコンストラクタはコンポーネントにイベントリスナを追加することに適した場所です。

```js
constructor() {
  super();
  this.addEventListener('click', (e) => console.log(e.type, e.target.localName));
}
```

コンポーネント自身にイベントリスナを追加することはevent delegationの用途で利用されます。そうすることでコード量を削減したり、パフォーマンスを改善することができます。
詳しくは[event delegation](#Event_delegation)を見てください。
通常、この用途ではどの要素でイベントが発生したかはeventの`target`プロパティで判別します。

しかし、コンポーネント自身にイベントリスナを追加すると、そのイベントリスナではコンポーネントのShadow DOMで発生したイベントの`target`はコンポーネント自身になります。
詳しくは[Shadow DOMでイベントを扱う](#Shadow_DOMでイベントを扱う)を見てください。

これを回避するには、イベントリスナをコンポーネント自身ではなくコンポーネントのshadow root自身に追加します。
`shadowRoot`(`renderRoot`プロパティ)は`constructor`で使うことができないので、イベントリスナは下記のように`createRenderRoot`メソッド内で追加します。
この場合、`createRenderRoot`メソッドは必ずshadow rootを返さなければなりません。

```
import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

@customElement('my-element')
class MyElement extends LitElement {
  @property() hostName = '';
  @property() shadowName = '';

  constructor() {
    super();
    this.addEventListener('click',
      (e: Event) => this.hostName = (e.target as Element).localName);
  }

  protected createRenderRoot() {
    const root = super.createRenderRoot();
    root.addEventListener('click',
      (e: Event) => this.shadowName = (e.target as Element).localName);
    return root;
  }

  protected render() {
    return html`
      <p><button>Click Me!</button></p>
      <p>Component target: ${this.hostName}</p>
      <p>Shadow target: ${this.shadowName}</p>
    `;
  }
}
```

### 他の要素にイベントリスナを追加する

コンポーネント自身とテンプレートにあるDOM以外の要素(例: `window`、`document`、メインのDOMツリー上にある要素)にイベントリスナを追加したい場合、
`connectedCallback`でイベントリスナを追加します。そして、`disconnectedCallback`でイベントリスナを削除します。

* `disconnectedCallback`でイベントリスナを削除する処理を記述することは、コンポーネントが破棄されたりページ上から削除された時にコンポーネントがクリーンアップされることを保証します。

* (コンストラクタや`firstUpdated`の代わりに)`connectedCallback`でイベントリスナを追加する処理を追加することは、コンポーネントがページ上から削除されて後に追加されたときに再びイベントリスナが追加されることを保証します。

```js
connectedCallback() {
  super.connectedCallback();
  window.addEventListener('resize', this._handleResize);
}
disconnectedCallback() {
  window.removeEventListener('resize', this._handleResize);
  super.disconnectedCallback();
}
```

`connectedCallback` and `disconnectedCallback`の詳しい情報は[lifecycle callbacks](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#Using_the_lifecycle_callbacks)を見てください。

### パフォーマンスの向上

通常、イベントリスナを追加する処理はとても高速なので、パフォーマンス上の問題になりません。
しかし、高頻度で使用され、多くのイベントリスナを持つコンポーネントでは、
[event delegation](#Event_delegation)を使ってイベントリスナを削減してレンダリング後に[非同期でイベントリスナを追加する](#非同期でイベントリスナを追加する)ことで初回レンダリングのパフォーマンスを向上させることができます。

#### Event delegation

event delegationを用いるとイベントリスナーを削減することができるのでパフォーマンスを向上させることができます。
また、イベントの処理を集約することができるのでコードを削減することができます。
Event delegationはイベントバブリング時のみを取り扱います。
詳しくは[イベントをdispatchする](#イベントをdispatchする)を見てください。

イベントバブリング時はイベントが発生した要素の祖先の要素にイベントが伝播します。
このことを利用するには祖先の要素にイベントリスナを追加して、どの子孫要素からバブリングによってイベントがdispatchされたか知る必要があります。
`Event`インスタンスの`target`プロパティでどの子孫要素からイベントがdispatchされたか特定することができます。

#### 非同期でイベントリスナを追加する

レンダリング後にイベントリスナを追加するには、`firstUpdated`メソッドを使います。
これはコンポーネントの初回に更新でテンプレートが最初にレンダリングされた後に実行されるLitのライフサイクルコールバックです。

`firstUpdated`コールバックはコンポーネントの初回の更新で`render`メソッドを実行した後とブラウザが描画する前の間に実行されます。
詳しくは[firstUpdated](https://japanese-document.github.io/lit/components-lifecycle.html#firstUpdated())を見てください。

コンポーネントが表示された後にイベントリスナを追加するには、下記のようにブラウザが描画した後に解決するPromiseをawaitします。

```js
async firstUpdated() {
  // ブラウザの描画処理に譲る
  await new Promise((r) => setTimeout(r, 0));
  this.addEventListener('click', this._handleClick);
}
```

### イベントリスナの`this`

テンプレート内で[Event listener expressions](https://japanese-document.github.io/lit/templates-expressions.html#Event_listener_expressions)(`@`)を使って宣言的に追加されたイベントリスナは自動的にコンポーネントがbindされます。

だから、下記のように宣言的に追加されたイベントハンドラでは`this`でコンポーネントインスタンスを参照することができます。

```js
class MyElement extends LitElement {
  render() {
    return html`<button @click="${this._handleClick}">click</button>`;
  }
  _handleClick(e) {
    console.log(this.prop);
  }
}
```

`addEventListener`を使ってイベントリスナを追加する場合、下記のように`this`でコンポーネントを参照するためにアロー関数を使う必要があります。

```ts
export class MyElement extends LitElement {
  private _handleResize = () => {
    // thisはコンポーネントを参照する
    console.log(this.isConnected);
  }

  constructor() {
    window.addEventListener('resize', this._handleResize);
  }
}
```

詳しくは[thisのドキュメント](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this)を見てください。

### ループするテンプレートでイベントを取り扱う

下記のように、テンプレートでループを使って要素を生成する場合、イベントバブリングを利用して[event delegation](#Event_delegation)を使うと便利です。
イベントバブリングしないイベント(focus)の場合、ループで生成される各要素にイベントリスナを加えます。

```ts
import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

@customElement('my-element')
class MyElement extends LitElement {
  @property() clicked = '';
  @property() focused = '';
  data = [1, 2, 3];

  protected render() {
    return html`
      <div key="container" @click=${this._clickHandler}>
        ${this.data.map(i => html`
          <button key=${i} @focus=${this._focusHandler}>Item ${i}</button>
        `)}
      </div>
      <p>Clicked: ${this.clicked}</p>
      <p>Focused: ${this.focused}</p>
    `;
  }

  private _clickHandler(e: Event) {
    this.clicked = (e.target as Element).getAttribute('key')!;
  }

  private _focusHandler(e: Event) {
    this.focused = (e.target as Element).textContent!;
  }
}
```

### イベントリスナを削除する

`null`、`undefined`、`nothing`を[Event listener expressions](https://japanese-document.github.io/lit/templates-expressions.html#Event_listener_expressions)に渡すと、既存のイベントリスナは削除されます。

## イベントをdispatchする

すべてのDOM Nodeは`dispatchEvent`メソッドでイベントをdispatchすることができます。
下記のように、第1引数にイベントタイプと第2引数にオプションを指定してEventインスタンスを生成します。
それを`dispatchEvent`に渡します。

```js
const event = new Event('my-event', {bubbles: true, composed: true});
myElement.dispatchEvent(event);
```

[bubbles](https://developer.mozilla.org/en-US/docs/Web/API/Event/Event#values)オプションに`true`をセットするとイベントをdispatchした要素の先祖方向にイベントが伝播します。
この設定をしないと[event delegation](#Event_delegation)を行うことができません。

`composed`オプションを`true`にするとイベントをdispatchした要素が所属しているShadow DOMツリーの外にもイベントが伝播します。

詳しくは[Shadow DOMでイベントを扱う](#Shadow_DOMでイベントを扱う)と[EventTarget.dispatchEvent()](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent)を見てください。

### どんなときイベントをdispatchするべきか

イベントのdispatchはユーザの操作もしくはコンポーネントのステート(state)の非同期的な変更時に実行されるべきです。
Webのネイティブ要素がそうであるように、コードでコンポーネントのプロパティもしくは属性を変更した時にイベントをdispatchするべきではありません。

例えば、input要素にユーザが入力したら`change`イベントがdispatchされます。
しかし、コードで`input`要素の`value`プロパティを変更した場合、`change`イベントはdispatchされません。

同様にメニューコンポーネントはメニューの項目が選択されたときはイベントがdispatchされるべきです。メニューコンポーネントの`selectedItem`プロパティがセットされた場合はイベントをdispatchするべきではありません。

通常、コンポーネントがリスニングしているイベントに応じてそれに適した別のイベントをdispatchするべきです。

```ts
import {LitElement, html} from 'lit';
import {customElement, query} from 'lit/decorators.js';

@customElement('my-dispatcher')
class MyDispatcher extends LitElement {
  @query('input', true) _input!: HTMLInputElement;

  protected render() {
    return html`
      <p>Name: <input></p>
      <p><button @click=${this._dispatchLogin}>Login</button></p>
    `;
  }

  private _dispatchLogin() {
    const name = this._input.value.trim();
    if (name) {
      const options = {
        detail: {name},
        bubbles: true,
        composed: true
      };
      this.dispatchEvent(new CustomEvent('mylogin', options));
    }
  }
}
```

```ts
import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

@customElement('my-listener')
class MyListener extends LitElement {
  @property() name = '';

  protected render() {
    return html`
      <p @mylogin=${this._loginListener}><slot></slot></p>
      <p>Login: ${this.name}</p>`;
  }

  private _loginListener(e: CustomEvent) {
    this.name = e.detail.name;
  }
}
```

```html
<script type="module" src="./my-listener.js"></script>
<script type="module" src="./my-dispatcher.js"></script>

<my-listener>
  <my-dispatcher></my-dispatcher>
</my-listener>
```

### 要素の更新の後にイベントをdispatchする

ほとんどの場合、イベントは要素の更新とレンダリングの後に発生するべきです。
これはユーザの操作から生じたレンダリング結果の変化を伝播するためのイベントの場合は必須です。
この場合、ステートの変更の後、イベントをdispatchする前にコンポーネントの`updateComplete` Promiseをawaitします。

```ts
import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

@customElement('my-dispatcher')
class MyDispatcher extends LitElement {
  @property({type: Boolean}) open = true;

  protected render() {
    return html`
      <p><button @click=${this._notify}>${this.open ? 'Close' : 'Open'}</button></p>
      <p ?hidden=${!this.open}>Content!</p>
    `;
  }

  private async _notify() {
    this.open = !this.open;
    await this.updateComplete;
    const name = this.open ? 'opened' : 'closed';
    this.dispatchEvent(new CustomEvent(name, {bubbles: true, composed: true}));
  }
}
```

```ts
import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

@customElement('my-listener')
class MyListener extends LitElement {
  @property({type: Number}) height: number|null = null;

  protected render() {
    return html`
      <p @opened=${this._listener} @closed=${this._listener}><slot></slot></p>
      <p>Height: ${this.height}px</p>`;
  }

  private _listener() {
    this.height = null;
  }

  protected updated() {
    if (this.height === null) {
      requestAnimationFrame(() => this.height = this.getBoundingClientRect().height);
    }
  }
}
```

```html
<script type="module" src="./my-listener.js"></script>
<script type="module" src="./my-dispatcher.js"></script>

<my-listener>
  <my-dispatcher></my-dispatcher>
</my-listener>
```

### EventとCustomEventを扱う

イベントは`Event`もしくは`CustomEvent`です。どちらを使っても良いです。
`CustomEvent`を使う場合、イベントのデータは`detail`プロパティにセットします。
`Event`を使う場合、`Event`クラスのサブクラスを作成します。そして、それにAPIを追加します。

詳しくは[Event](https://developer.mozilla.org/en-US/docs/Web/API/Event/Event)と[CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent)を見てください。

#### CustomEventの使い方

```js
const event = new CustomEvent('my-event', {
  detail: {
    message: 'Something important happened'
  }
});

this.dispatchEvent(event);
```

#### Eventの使い方

```js
class MyEvent extends Event {
  constructor(message) {
    super();
    this.type = 'my-event';
    this.message = message;
  }
}

const event = new MyEvent('Something important happened');
this.dispatchEvent(event);
```

## Shadow DOMでイベントを扱う

Shadow DOMでイベントを取り扱う場合の注意点があります。
Shadow DOMはshadow要素に関する詳細を外部に公開せずカプセル化します。
Shadow DOMから生じたイベントはshadow要素の詳細を外部のDOM要素に渡しません。

### Composedイベント

デフォルトでshadow root内でdispatchされた上記で作成したイベントはshadow rootの外には伝播しません。
イベントがshadow domの外にも伝播するには[`composed`プロパティ](https://developer.mozilla.org/en-US/docs/Web/API/Event/composed)を`true`にします。
通常、DOMツリーのすべてのNodeにイベントを伝播するために`composed`と一緒に`bubbles`も`true`にします。

```js
_dispatchMyEvent() {
  let myEvent = new CustomEvent('my-event', {
    detail: { message: 'my-event happened.' },
    bubbles: true,
    composed: true });
  this.dispatchEvent(myEvent);
}
```

イベントの`composed`と`bubbles`が有効である場合、
イベントは(shadow rootの外側にある要素を含む)イベントをdispatchした要素のすべての祖先要素に伝播します。
イベントの`composed`が有効で`bubbles`が無効である場合、
イベントはイベントをdispatchした要素からDOMツリー上のshadow rootを含む要素まで伝播します。

すべてのマウスイベント、タッチイベント、キーボードイベントを含むほとんどの標準のユーザーインターフェースイベントでは`bubbles`と`composed`が両方有効です。
詳しくは[こちら](https://developer.mozilla.org/en-US/docs/Web/API/Event/composed)を見てください。

### Eventのtargetプロパティ

shadow rootもしくはその祖先要素のイベントリスナで、
shadow root内でdispatchされた[Composedイベント](#Composedイベント)のtargetプロパティはDOMツリー上のshadow rootを含む要素になっています。
Litコンポーネントはshadow root内にレンダリングされるので、
Litコンポーネント内からdispatchされたComposedイベントはLitコンポーネントでdispatchされたように見えます。
その`Event`の`target`プロパティはLitコンポーネントです。

```html
<my-element onClick="(e) => console.log(e.target)"></my-element>
```

```js
render() {
  return html`
    <button id="mybutton" @click="${(e) => console.log(e.target)}">
      click me
    </button>`;
}
```

イベントが発生した要素を割り出したい場合、`event.composedPath()` APIを使います。
このメソッドはshadow root内の要素を含むすべてのイベントが通過したNodeの配列を返します。
これはカプセル化されている前提の実装を閲覧するので、それらライブラリの場合はその実装の変更に気づかないかもしれません。
だから、shadow root内の実装に依存するような処理を実装する際は注意してください。
これの一般的なユースケースはクライアントサイドのルーティングでクリックされた要素がアンカータグかどうかを判別することです。

```js
handleMyEvent(event) {
  console.log('Origin: ', event.composedPath()[0]);
}
```

詳しくは[composedPath](https://developer.mozilla.org/en-US/docs/Web/API/Event/composedPath)を見てください。

## イベントディスパッチャーとイベントリスナ間でデータをやり取りする

イベントはイベントの発信元からイベントリスナに変化を通知するために使われます。
そして、イベントリスナから発信元へそのイベントの返信することにも使うことができます。

これをする1つの方法はEventインスタンスに発信元のコンポーネントを操作するためのAPIを用意することです。
例えば、イベントリスナでCustomEventの`detail`プロパティにイベントの発信元のコンポーネントのプロパティをセットして、それを使ってコンポーネントの動作を変更します。

イベントの発信元とイベントリスナがやりとりをするもう1つ方法は`preventDefault()`を使う方法です。
`preventDefault()`はイベントが標準のアクションを実行しないことを示すために使われます。
イベントリスナが`preventDefault()`を実行するとイベントインスタンスの`defaultPrevented`プロパティの値を`true`にします。
このフラグはイベントリスナがイベントの発信元の動作を変更することに使うことができます。

この2つのテクニックは下記の例で使われています。

```ts
import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

@customElement('my-listener')
class MyListener extends LitElement {
  @property() canCheck = false;
  protected render() {
    return html`
      <p @checked=${this._checkedHandler}><slot></slot></p>
      <hr>
      <p>${this.canCheck ? 'Allowing' : 'Preventing'} check</p>
      <p><button @click=${this._clickHandler}>Toggle</button></p>`;
  }
  private _checkedHandler(e: CustomEvent) {
    if (!this.canCheck) {
      e.preventDefault();
      e.detail.message = '✅ Prevented!!';
    }
  }
  private _clickHandler() {
    this.canCheck = !this.canCheck;
  }
}


@customElement('my-dispatcher')
class MyDispatcher extends LitElement {
  @property() label = 'Check me!';
  defaultMessage = '🙂';
  @property() message = this.defaultMessage;
  private _resetMessage?: ReturnType<typeof setTimeout>;
  protected render() {
    return html`
      <label><input type="checkbox" @click=${this._tryChange}>${this.label}</label>
      <div>${this.message}</div>
    `;
  }
  private _tryChange(e: Event) {
    const detail = {message: this.message};
    const event = new CustomEvent('checked', {detail, bubbles: true, composed: true, cancelable: true});
    this.dispatchEvent(event);
    if (event.defaultPrevented) {
      e.preventDefault();
    }
    this.message = detail.message;
  }
  protected updated() {
    clearTimeout(this._resetMessage);
    this._resetMessage =
      setTimeout(() => this.message = this.defaultMessage, 1000);
  }
}

// <my-listener>
//   <my-dispatcher></my-dispatcher>
// </my-listener>
```

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