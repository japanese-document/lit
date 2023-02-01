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

要素がdocumentに接続された後、Litは更新サイクルの一番目の処理を開始します。
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

![update-1](/lit/images/components-update-1.jpg)

![update-2](/lit/images/components-update-2.jpg)

**更新**

![update-3](/lit/images/components-update-3.jpg)

**更新後**

![update-4](/lit/images/components-update-4.jpg)

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
| 更新は発動するか | はい、このメソッド内でプロパティが変更されると新たに更新サイクルがスケジュールされます。 |
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
| 更新は発動するか | はい、このメソッド内でプロパティが変更されると新たに更新サイクルがスケジュールされます。 |
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
それが`true`なら更新サイクルが終了した後に待機している更新はありません。

要素の更新は、その子要素の更新を引き起こす場合があります。
デフォルトではその要素の更新が完了すると`updateComplete` Promiseは解決しますが、その要素の子要素の更新が完了するまで待ちません。
この動作は[`getUpdateComplete()`](#getUpdateComplete())をオーバーライドすることで変更することができます。

下記はコンポーネントの更新が完了することが必要な処理の例です。

1. **テスト**
テストを書く時、コンポーネントのDOMをassertする前に`updateComplete` Promiseを`await`します。
しかし、assertする段階でコンポーネントの子孫要素全体の更新が完了している必要がある場合、通常は`requestAnimationFrame`コールバックを使うことを推奨します。
理由はLitのデフォルトのスケジューリングがブラウザのmicrotaskキューを使っているからです。microtaskキューはanimation frameの前に空になります。
これによって、ページ内で待機しているすべてのLitの更新が`requestAnimationFrame`コールバックより前で完了します。

2. **計測** Some components may need to measure DOM in order to implement certain layouts. While it is always better to implement layouts using pure CSS rather than JavaScript-based measurement, sometimes CSS limitations make this unavoidable. In very simple cases, and if you're measuring Lit or ReactiveElement components, it may be sufficient to await `updateComplete` after state changes and before measuring. However, because `updateComplete` does not await the update of all descendants, we recommend using [`ResizeObserver`](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver) as a more robust way to trigger measurement code when layouts change.

3. **イベント** It is a good practice to dispatch events from components after rendering has completed, so that the event's listeners see the fully rendered state of the component. To do so, you can await the `updateComplete` promise before firing the event.

    ```js
    async _loginClickHandler() {
      this.loggedIn = true;
      // Wait for `loggedIn` state to be rendered to the DOM
      await this.updateComplete;
      this.dispatchEvent(new Event('login'));
    }
    ```

The `updateComplete` promise rejects if there's an unhandled error during the update cycle. For more information, see [Handling errors in the update cycle](#errors-in-the-update-cycle).

### Handling errors in the update cycle

If you have an uncaught exception in a lifecycle method like `render()` or `update()`, it  causes the `updateComplete` promise to reject.
If you have code in a lifecycle method that can throw an exception, it's good practice to put it inside a `try`/`catch` statement.

You may also want to use a `try`/`catch` if you're awaiting the `updateComplete` promise:

```js
try {
  await this.updateComplete;
} catch (e) {
  /* handle error */
}
```

In some cases, code may throw in unexpected places. As a fallback, you can add a handler for `window.onunhandledrejection` to catch these issues. For example, you could use this report errors back to a backend service to help diagnose issues that are hard to reproduce.

```js
window.onunhandledrejection = function(e) {
  /* handle error */
}
```

### Implementing additional customization

This section covers some less-common methods for customizing the update cycle.

#### scheduleUpdate()

Override `scheduleUpdate()` to customize the timing of the update. `scheduleUpdate()` is called when an update is about to be performed, and by default it calls `performUpdate()` immediately. Override it to defer the update—this technique can be used to unblock the main rendering/event thread. 

For example, the following code schedules the update to occur after the next frame paints, which can reduce jank if the update is expensive:

{% switchable-sample %}

```ts
protected override async scheduleUpdate(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve));
  super.scheduleUpdate();
}
```

```js
async scheduleUpdate() {
  await new Promise((resolve) => setTimeout(resolve));
  super.scheduleUpdate();
}
```

{% endswitchable-sample %}

If you override `scheduleUpdate()`, it's your responsibility to call `super.scheduleUpdate()` to perform the pending update.

{% aside "info" %}

Async function optional.

This example shows an [async function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) which _implicitly_ returns a promise. You can also write `scheduleUpdate()` as a function that _explictly_ returns a `Promise`. In either case, the **next** update doesn't start until the promise returned by `scheduleUpdate()` resolves. 

{% endaside %}


#### performUpdate()

Implements the reactive update cycle, calling the other methods, like `shouldUpdate()`, `update()`, and `updated()`.

Call `performUpdate()` to immediately process a pending update. This should generally not be needed, but it can be done in rare cases when you need to update synchronously. (If there is no update pending, you can call `requestUpdate()` followed by `performUpdate() to force a synchronous update.)

{% aside "info" %}

Use `scheduleUpdate()` to customize scheduling.

If you want to customize how updates are scheduled, override `scheduleUpdate()`. Previously, we recommended overriding `performUpdate()` for this purpose. That continues to work, but it makes it more difficult to call `performUpdate()` to process a pending update synchronously. 

{% endaside %}

#### hasUpdated

The `hasUpdated` property returns true if the component has updated at least once. You can use `hasUpdated` in any of the lifecycle methods to perform work only if the component has not yet updated.


#### getUpdateComplete()

To await additional conditions before fulfilling the `updateComplete` promise, override the `getUpdateComplete()` method. For example, it may be useful to await the update of a child element. First await `super.getUpdateComplete()`, then any subsequent state.

<div class="alert alert-info">

It's recommended to override the `getUpdateComplete()` method instead of the `updateComplete` getter to ensure compatibility with users who are using TypeScript's ES5 output (see [TypeScript#338](https://github.com/microsoft/TypeScript/issues/338)).

</div>

```js
class MyElement extends LitElement {
  async getUpdateComplete() {
    await super.getUpdateComplete();
    await this._myChild.updateComplete;
  }
}
```

## External lifecycle hooks: controllers and decorators

In addition to component classes implementing lifecycle callbacks, external code, such as [decorators](https://lit.dev/docs/components/decorators/) may need to hook into a component's lifecycle.

Lit offers two concepts for external code to integrate with the reactive update lifecycle: `static addInitializer()` and `addController()`:

#### static addInitializer()

`addInitializer()` allows code that has access to a Lit class definition to run code when instances of the class are constructed.

This is very useful when writing custom decorators. Decorators are run at class definition time, and can do things like replace field and method definitions. If they also need to do work when an instance is created, they must call `addInitializer()`. It will be common to use this to add a [reactive controller](https://lit.dev/docs/composition/controllers/) so decorators can hook into the component lifecycle:

{% switchable-sample %}

```ts
// A TypeScript decorator
const myDecorator = (proto: ReactiveElement, key: string) => {
  const ctor = proto.constructor as typeof ReactiveElement;

  ctor.addInitializer((instance: ReactiveElement) => {
    // This is run during construction of the element
    new MyController(instance);
  });
};
```

```js
// A Babel "Stage 2" decorator
const myDecorator = (descriptor) => {
  ...descriptor,
  finisher(ctor) {
    ctor.addInitializer((instance) => {
      // This is run during construction of the element
      new MyController(instance);
    });
  },
};
```

{% endswitchable-sample %}


Decorating a field will then cause each instance to run an initializer
that adds a controller:

```ts
class MyElement extends LitElement {
  @myDecorator foo;
}
```

Initializers are stored per-constructor. Adding an initializer to a
subclass does not add it to a superclass. Since initializers are run in
constructors, initializers will run in order of the class hierarchy,
starting with superclasses and progressing to the instance's class.

#### addController()

`addController()` adds a reactive controller to a Lit component so that the component invokes the controller's lifecycle callbacks. See the [Reactive Controller](https://lit.dev/docs/composition/controllers/) docs for more information.

#### removeController()

`removeController()` removes a reactive controller so it no longer receives lifecycle callbacks from this component.

## Server-side reactive update cycle

<div class="alert alert-info">

Lit's [server-side rendering package](https://lit.dev/docs/ssr/overview/) is currently under active development so the following information is subject to change.

</div>

Not all of the update cycle is called when rendering Lit on the server. The following methods are called on the server.

![update-server](/lit/images/components-update-server.jpg)

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