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

### パフォーマンスを改善する

Adding event listeners is extremely fast and typically not a performance concern. However, for components that are used in high frequency and need a lot of event listeners, you can optimize first render performance by reducing the number of listeners used via [event delegation](#event-delegation) and adding listeners [asynchronously](#async-events) after rendering.

#### Event delegation

Using event delegation can reduce the number of event listeners used and therefore improve performance. It is also sometimes convenient to centralize event handling to reduce code. Event delegation can only be use to handle events that `bubble`. See [Dispatching events](#dispatching-events) for details on bubbling.

Bubbling events can be heard on any ancestor element in the DOM. You can take advantage of this by adding a single event listener on an ancestor component to be notified of a bubbling event dispatched by any of its descendants in the DOM. Use the event's `target` property to take specific action based on the element that dispatched the event.

{% playground-example "docs/components/events/delegation/" "my-element.ts" %}

#### Asynchronously adding event listeners { #async-events }

To add an event listener after rendering, use the `firstUpdated` method. This is a Lit lifecycle callback which runs after the component first updates and renders its templated DOM.

The `firstUpdated` callback fires after the first time your component has been updated and called its `render` method, but **before** the browser has had a chance to paint.

See [firstUpdated](/docs/components/lifecycle/#firstupdated) in the Lifecycle documentation for more information.

To ensure the listener is added after the user can see the component, you can await a Promise that resolves after the browser paints.

```js
async firstUpdated() {
  // Give the browser a chance to paint
  await new Promise((r) => setTimeout(r, 0));
  this.addEventListener('click', this._handleClick);
}
```

### Understanding `this` in event listeners

Event listeners added using the declarative `@` syntax in the template are automatically _bound_ to the component.

Therefore, you can use `this` to refer to your component instance inside any declarative event handler:

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

When adding listeners imperatively with `addEventListener`, you'll want to use an arrow function so that `this` refers to the component:

```ts
export class MyElement extends LitElement {
  private _handleResize = () => {
    // `this` refers to the component
    console.log(this.isConnected);
  }

  constructor() {
    window.addEventListener('resize', this._handleResize);
  }
}
```

See the [documentation for `this` on MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this) for more information.

### Listening to events fired from repeated templates

When listening to events on repeated items, it's often convenient to use [event delegation](#event-delegation) if the event bubbles. When an event does not bubble, a listener can be added on the repeated elements. Here's an example of both methods:

{% playground-example "docs/components/events/list/" "my-element.ts" %}

## Dispatching events { #dispatching-events }

All DOM nodes can dispatch events using the `dispatchEvent` method. First, create an event instance, specifying the event type and options. Then pass it to `dispatchEvent` as follows:

```js
const event = new Event('my-event', {bubbles: true, composed: true});
myElement.dispatchEvent(event);
```

The `bubbles` option allows the event to flow up the DOM tree to ancestors of the dispatching element. It's important to set this flag if you want the event to be able to participate in [event delegation](#event-delegation).

The `composed` option is useful to set to allow the event to be dispatched above the shadow DOM tree in which the element exists.

See [Working with events in shadow DOM](#shadowdom) for more information.

See [EventTarget.dispatchEvent()](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent) on MDN for a full description of dispatching events.

### When to dispatch an event

Events should be dispatched in response to user interaction or asynchronous changes in the component's state. They should generally **not** be dispatched in response to state changes made by the owner of the component via its property or attribute APIs. This is generally how native web platform elements work.

For example, when a user types a value into an `input` element a `change` event is dispatched, but if code sets the `input`'s `value` property, a `change` event is **not** dispatched.

Similarly, a menu component should dispatch an event when the user selects a menu item, but it should not dispatch an event if, for example, the menu's `selectedItem` property is set.

This typically means that a component should dispatch an event in response to another event to which it is listening.

{% playground-ide "docs/components/events/dispatch/" "my-dispatcher.ts" %}

### Dispatching events after an element updates

Often, an event should be fired only after an element updates and renders. This might be necessary if an event is intended to communicate a change in rendered state based on user interaction. In this case, the component's `updateComplete` Promise can be awaited after changing state, but before dispatching the event.

{% playground-ide "docs/components/events/update/" "my-dispatcher.ts" %}

### Using standard or custom events { #standard-custom-events }

Events can be dispatched either by constructing an `Event` or a `CustomEvent`. Either is a reasonable approach. When using a `CustomEvent`, any event data is passed in the event's `detail` property. When using an `Event`, an event subclass can be made and custom API attached to it.

See [Event](https://developer.mozilla.org/en-US/docs/Web/API/Event/Event) on MDN for details about constructing events.

#### Firing a custom event:

```js
const event = new CustomEvent('my-event', {
  detail: {
    message: 'Something important happened'
  }
});
this.dispatchEvent(event);
```

See the [MDN documentation on custom events](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent) for more information.

#### Firing a standard event:

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

When using shadow DOM there are a few modifications to the standard event system that are important to understand. Shadow DOM exists primarily to provide a scoping mechanism in the DOM that encapsulates details about these "shadow" elements. As such, events in shadow DOM encapsulate certain details from outside DOM elements.

### Understanding composed event dispatching {#shadowdom-composed}

By default, an event dispatched inside a shadow root will not be visible outside that shadow root. To make an event pass through shadow DOM boundaries, you must set the [`composed` property](https://developer.mozilla.org/en-US/docs/Web/API/Event/composed) to `true`. It's common to pair `composed` with `bubbles` so that all nodes in the DOM tree can see the event:

```js
_dispatchMyEvent() {
  let myEvent = new CustomEvent('my-event', {
    detail: { message: 'my-event happened.' },
    bubbles: true,
    composed: true });
  this.dispatchEvent(myEvent);
}
```

If an event is `composed` and does `bubble`, it can be received by all ancestors of the element that dispatches the event—including ancestors in outer shadow roots. If an event is `composed` but does not `bubble`, it can only be received on the element that dispatches the event and on the host element containing the shadow root.

Note that most standard user interface events, including all mouse, touch, and keyboard events, are both bubbling and composed. See the [MDN documentation on composed events](https://developer.mozilla.org/en-US/docs/Web/API/Event/composed) for more information.

### Understanding event retargeting {#shadowdom-retargeting}

[Composed](#shadowdom-composed) events dispatched from within a shadow root are retargeted, meaning that to any listener on an element hosting a shadow root or any of its ancestors, they appear to come from the hosting element. Since Lit components render into shadow roots, all composed events dispatched from inside a Lit component appear to be dispatched by the Lit component itself. The event's `target` property is the Lit component.

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

In advanced cases where it is required to determine the origin of an event, use the `event.composedPath()` API. This method returns an array of all the nodes traversed by the event dispatch, including those within shadow roots. Because this breaks encapsulation, care should be taken to avoid relying on implementation details that may be exposed.  Common use cases include determining if the element clicked was an anchor tag, for purposes of client-side routing.

```js
handleMyEvent(event) {
  console.log('Origin: ', event.composedPath()[0]);
}
```
See the [MDN documentation on composedPath](https://developer.mozilla.org/en-US/docs/Web/API/Event/composedPath) for more information.

## Communicating between the event dispatcher and listener

Events exist primarily to communicate changes from the event dispatcher to the event listener, but events can also be used to communicate information from the listener back to the dispatcher.

One way you can do this is to expose API on events which listeners can use to customize component behavior. For example, a listener can set a property on a custom event's detail property which the dispatching component then uses to customize behavior.

Another way to communicate between the dispatcher and listener is via the `preventDefault()` method. It can be called to indicate the event's standard action should not occur. When the listener calls `preventDefault()`, the event's `defaultPrevented` property becomes true. This flag can then be used by the listener to customize behavior.

Both of these techniques are used in the following example:

{% playground-ide "docs/components/events/comm/" "my-listener.ts" %}

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