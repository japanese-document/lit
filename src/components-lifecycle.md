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

コンポーネントがdocumentのdocumentに接続された(追加された)時に実行されます。

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

**Pre-Update**

![update-1](/lit/images/components-update-1.jpg)

![update-2](/lit/images/components-update-2.jpg)

**Update**

![update-3](/lit/images/components-update-3.jpg)

**Post-Update**

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
`render()`メソッドの後(例: `updated`内)でプロパティを変更した場合は新たなアップデートサイクルを発動します。
そして、変更されたプロパティは新たな`changedProperties`に反映されて次のアップデートサイクルで使われます。

### 更新の発動

An update is triggered when a reactive property changes or the `requestUpdate()` method is called.
Since updates are performed asynchronously, any and all changes that occur before the update is performed result in only a **single update**.

#### hasChanged() {#haschanged}

Called when a reactive property is set. By default `hasChanged()` does a strict equality check and if it returns `true`, an update is scheduled. See [configuring `hasChanged()`](https://japanese-document.github.io/lit/components-properties.html#hasChanged) for more information.

#### requestUpdate() {#requestUpdate}

Call `requestUpdate()` to schedule an explicit update. This can be useful if you need the element to update and render when something not related to a property changes. For example, a timer component might call `requestUpdate()` every second.

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

The list of properties that have changed is stored in a `changedProperties` map that’s passed to subsequent lifecycle methods. The map keys are the property names and its values are the previous property values.

Optionally, you can pass a property name and a previous value when calling `requestUpdate()`, which will be stored in the `changedProperties` map. This can be useful if you implement a custom getter and setter for a property. See [Reactive properties](https://japanese-document.github.io/lit/components-properties.html) for more information about implementing custom getters and setters.

```js
  this.requestUpdate('state', this._previousState);
```

### Performing an update {#reactive-update-cycle-performing}

When an update is performed, the `performUpdate()` method is called. This method calls a number of other lifecycle methods.

Any changes that would normally trigger an update which occur **while** a component is updating do **not schedule a new update**. This is done so that property values can be computed during the update process. Properties changed during the update **are reflected in the `changedProperties` map**, so subsequent lifecycle methods can act on the changes.

#### shouldUpdate() {#shouldupdate}

Called to determine whether an update cycle is required.

| | |
|-|-|
| Arguments | `changedProperties`: `Map` with keys that are the names of changed properties and  values that are the corresponding previous values. |
| Updates | No. Property changes inside this method do not trigger an element update. |
| Call super? | Not necessary. |
| Called on server? | No. |

If `shouldUpdate()` returns `true`, which it does by default, then the update proceeds normally. If it returns `false`, the rest of the update cycle will not be called but the `updateComplete` Promise is still resolved.

You can implement `shouldUpdate()` to specify which property changes should cause updates. Use the map of `changedProperties` to compare current and previous values.

{% switchable-sample %}

```ts
shouldUpdate(changedProperties: Map<string, any>) {
  // Only update element if prop1 changed.
  return changedProperties.has('prop1'); 
}
```

```js
shouldUpdate(changedProperties) {
  // Only update element if prop1 changed.
  return changedProperties.has('prop1');
}
```

{% endswitchable-sample %}

#### willUpdate() {#willupdate}

Called before `update()` to compute values needed during the update.

| | |
|-|-|
| Arguments |  `changedProperties`: `Map` with keys that are the names of changed properties and values that are the corresponding previous values. |
| Updates? | No. Property changes inside this method do not trigger an element update. |
| Call super? | Not necessary. |
| Called on server? | Yes. |

Implement `willUpdate()` to compute property values that depend on other properties and are used in the rest of the update process.

{% switchable-sample %}

```ts
willUpdate(changedProperties: PropertyValues<this>) {
  // only need to check changed properties for an expensive computation.
  if (changedProperties.has('firstName') || changedProperties.has('lastName')) {
    this.sha = computeSHA(`${this.firstName} ${this.lastName}`);
  }
}

render() {
  return html`SHA: ${this.sha}`;
}
```

```js
willUpdate(changedProperties) {
  // only need to check changed properties for an expensive computation.
  if (changedProperties.has('firstName') || changedProperties.has('lastName')) {
    this.sha = computeSHA(`${this.firstName} ${this.lastName}`);
  }
}

render() {
  return html`SHA: ${this.sha}`;
}
```

{% endswitchable-sample %}

#### update() {#update}

Called to update the component's DOM.

| | |
|-|-|
| Arguments | `changedProperties`: `Map` with keys that are the names of changed properties and  values that are the corresponding previous values. |
| Updates? | No. Property changes inside this method do not trigger an element update. |
| Call super? | Yes. Without a super call, the element’s attributes and template will not update. |
| Called on server? | No. |

Reflects property values to attributes and calls `render()` to update the component’s internal DOM.

Generally, you should not need to implement this method.

#### render() {#render}

Called by `update()` and should be implemented to return a renderable result (such as a `TemplateResult`) used to render the component's DOM.

| | |
|-|-|
| Arguments | None. |
| Updates? | No. Property changes inside this method do not trigger an element update. |
| Call super? | Not necessary. |
| Called on server? | Yes. |

The `render()` method has no arguments, but typically it references component properties. See [Rendering](https://japanese-document.github.io/lit/components-rendering.html) for more information.

```js
render() {
  const header = `<header>${this.header}</header>`;
  const content = `<section>${this.content}</section>`;
  return html`${header}${content}`;
}
```

### Completing an update {#reactive-update-cycle-completing}

After `update()` is called to render changes to the component's DOM, you can perform actions on the component's DOM using these methods.

#### firstUpdated() {#firstupdated}

Called after the component's DOM has been updated the first time, immediately before [`updated()`](#updated) is called.

| | |
|-|-|
| Arguments | `changedProperties`: `Map` with keys that are the names of changed properties and  values that are the corresponding previous values. |
| Updates? | Yes. Property changes inside this method schedule a new update cycle. |
| Call super? | Not necessary. |
| Called on server? | No. |

Implement `firstUpdated()` to perform one-time work after the component's DOM has been created. Some examples might include focusing a particular rendered element or adding a [ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver) or [IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver) to an element.

```js
firstUpdated() {
  this.renderRoot.getElementById('my-text-area').focus();
}
```

#### updated() {#updated}

Called whenever the component’s update finishes and the element's DOM has been updated and rendered.

| | |
|-|-|
| Arguments | `changedProperties`: `Map` with keys that are the names of changed properties and  values that are the corresponding previous values. |
| Updates? | Yes. Property changes inside this method trigger an element update. |
| Call super? | Not necessary. |
| Called on server? | No. |

Implement `updated()` to perform tasks that use element DOM after an update. For example, code that performs animation may need to measure the element DOM.

{% switchable-sample %}

```ts
updated(changedProperties: Map<string, any>) {
  if (changedProperties.has('collapsed')) {
    this._measureDOM();
  }
}
```

```js
updated(changedProperties) {
  if (changedProperties.has('collapsed')) {
    this._measureDOM();
  }
}
```

{% endswitchable-sample %}

#### updateComplete {#updatecomplete}

The `updateComplete` Promise resolves when the element has finished updating. Use `updateComplete` to wait for an update. The resolved value is a Boolean indicating if the element has finished updating. It will be `true` if there are no pending updates after the update cycle has finished.

It is a good practice to dispatch events from components after rendering has completed, so that the event's listeners see the fully rendered state of the component. To do so, you can await the `updateComplete` Promise before firing the event.

```js
async _loginClickHandler() {
  this.loggedIn = true;
  // Wait for `loggedIn` state to be rendered to the DOM
  await this.updateComplete;
  this.dispatchEvent(new Event('login'));
}
```

Also, when writing tests you can await the `updateComplete` Promise before making assertions about the component’s DOM.

The `updateComplete` promise rejects if there's an unhandled error during the update cycle. For more information, see [Handling errors in the update cycle](#errors-in-the-update-cycle).

### Handling errors in the update cycle {#errors-in-the-update-cycle}

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
  /* handle error *
}
```

### Implementing additional customization {#reactive-update-cycle-customizing}

This section covers some less-common methods for customizing the update cycle.

#### scheduleUpdate() {#scheduleupdate}

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


#### performUpdate()  {#performupdate}

Implements the reactive update cycle, calling the other methods, like `shouldUpdate()`, `update()`, and `updated()`.

Call `performUpdate()` to immediately process a pending update. This should generally not be needed, but it can be done in rare cases when you need to update synchronously. (If there is no update pending, you can call `requestUpdate()` followed by `performUpdate() to force a synchronous update.)

{% aside "info" %}

Use `scheduleUpdate()` to customize scheduling.

If you want to customize how updates are scheduled, override `scheduleUpdate()`. Previously, we recommended overriding `performUpdate()` for this purpose. That continues to work, but it makes it more difficult to call `performUpdate()` to process a pending update synchronously. 

{% endaside %}

#### hasUpdated  {#hasupdated}

The `hasUpdated` property returns true if the component has updated at least once. You can use `hasUpdated` in any of the lifecycle methods to perform work only if the component has not yet updated.


#### getUpdateComplete() {#getUpdateComplete}

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

#### static addInitializer() {#addInitializer}

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

#### addController() {#addController}

`addController()` adds a reactive controller to a Lit component so that the component invokes the controller's lifecycle callbacks. See the [Reactive Controller](https://lit.dev/docs/composition/controllers/) docs for more information.

#### removeController() {#removeController}

`removeController()` removes a reactive controller so it no longer receives lifecycle callbacks from this component.

## Server-side reactive update cycle {#server-reactive-update-cycle}

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