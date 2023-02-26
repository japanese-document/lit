{ "header": {"name": "コンポーネント", "order": 0}, "order": 5 }
---
# Shadow DOM

LitコンポーネントはDOMをカプセル化するために[Shadow DOM](https://developers.google.com/web/fundamentals/web-components/shadowdom)を使います。
Shadow DOMを使うとコンポーネントにdocumentから別箇でカプセル化されたDOMツリーを追加することができます。
DOMのカプセル化はページ内で動作する(Web componentsやLitコンポーネントを含む)他のコードとの相互運用性を実現するための鍵です。

Shadow DOMには下記の利点があります。

* DOMの公開範囲を限定します。`document.querySelector`のようなDOM APIはコンポーネントのShadow DOMを見つけません。これはグローパルスクリプトが意図せずコンポーネントを破壊する可能性を低くします。
* スタイルの適用範囲を限定します。Shadow DOMのカプセル化されたスタイルはDOMツリーの属する他のDOMに影響を与えません。
* 組み合わせることができます。コンポーネントのshadow rootはコンポーネントのDOMを保有しますが、そのコンポーネントの子コンポーネントからは分離されています。親コンポーネントと子コンポーネント間で相互に相手のDOMにアクセスすることはできません。

Shadow DOMに関する詳しい情報は[Shadow DOM v1: Self-Contained Web Components](https://developers.google.com/web/fundamentals/web-components/shadowdom)と[Using shadow DOM](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM)を見てください。

## Shadow DOM内のNodeにアクセスする

Litは`renderRoot`にコンポーネントをレンダリングします。shadow rootはデフォルトで[renderRoot](https://japanese-document.github.io/lit/api-LitElement.html#renderRoot()__Element_|_ShadowRoot)です。
コンポーネント内の要素を取得するために`this.renderRoot.querySelector()`のようなDOMクエリーAPIを使います。

`renderRoot`はshadow rootもしくは1つの要素です。それらは`.querySelectorAll()`や`.children`のようなAPIを持ちます。

下記の例では、(`firstUpdated`で)コンポーネントの最初のレンダリングの後にコンポーネント内のDOMを取得しています。
また、ゲッタでコンポーネント内のDOMを取得しています。

```js
firstUpdated() {
  this.staticNode = this.renderRoot.querySelector('#static-node');
}

get _closeButton() {
  return this.renderRoot.querySelector('#close-button');
}
```

LitElementは上記のゲッタの処理を省略して書くためのデコレータのセットを用意しています。

### @query、@queryAll、@queryAsyncデコレータ

@query、@queryAll、@queryAsyncデコレータを使うとコンポーネント内にあるNodeに簡単にアクセスすることができます。

#### @query

クラスプロパティを`renderRoot`からNodeを返すゲッタに変更します。
オプションである第2引数にtrueを渡すとDOMクエリは1回のみ実行され、その結果がキャッシュされます。
これは取得対象のNodeが代わらないケースではパフォーマンスが向上します。

```js
import {LitElement, html} from 'lit';
import {query} from 'lit/decorators/query.js';

class MyElement extends LitElement {
  @query('#first')
  _first;

  render() {
    return html`
      <div id="first"></div>
      <div id="second"></div>
    `;
  }
}
```

上記のデコレータを使ったコードは下記と等価です。

```js
get _first() {
  return this.renderRoot?.querySelector('#first') ?? null;
}
```

#### @queryAll

`@query`と似ていますがマッチするNodeを1つだけ返すのではなくすべて返します。
これは`querySelectorAll`を実行することと等価です。

```js
import {LitElement, html} from 'lit';
import {queryAll} from 'lit/decorators/queryAll.js';

class MyElement extends LitElement {
  @queryAll('div')
  _divs;

  render() {
    return html`
      <div id="first"></div>
      <div id="second"></div>
    `;
  }
}
```

上記の`_divs`はテンプレート内の`<div>`要素を2つとも返します。
TypeScriptでの`@queryAll`プロパティの型は`NodeListOf<HTMLElement>`です。
取得するNodeが明確である場合、より詳細な型を指定することができます。

```js
@queryAll('button')
_buttons!: NodeListOf<HTMLButtonElement>
```

`buttons`の後の`!`はTypeScriptの[non-null assertion operator](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-0.html#non-null-assertion-operator)です。
これは`buttons`には常に`null`と`undefined`が入らないことを示します。

#### @queryAsync

`@query`と似ています。`@queryAsync`はNodeを返すのではなく、保留中のレンダリングが完了した後にNodeを解決するPromiseを返します。
`updateComplete` Promiseをawaitする代わりにこれを使うことができます。
これは`@queryAsync`によって返されるNodeが他のプロパティの変更に影響を受ける場合役立ちます。

## slot要素を使って子要素をレンダリングする

下記のようにコンポーネントに子要素を配置することができます。

```html
<my-element>
  <p>A child</p>
</my-element>
```
デフォルトでは要素がshadow treeを持つ場合、その子要素はレンダリングされません。

子要素をレンダリングするにはテンプレートに[`<slot>`要素](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/slot)を1つ以上配置する必要があります。
`<slot>`要素を使って子要素を配置する位置を指定します。

### slot要素を使う

To render an element's children, create a `<slot>` for them in the element's template.
子要素をレンダリングするには、要素のテンプレートに`<slot>`を配置します。
子要素は`<slot>`要素の子要素の様にレンダリングされます。

### 名前付きslotを使う

子要素を指定した`slot`要素に割り当てるには、子要素の`slot`属性をslot要素の`name`属性にマッチさせます。

* **名前付きslotは子要素の`slot`属性とマッチした場合のみ適用されます。**

  例: `<slot name="one"></slot>`は属性に`slot="one"`がある子要素のみ適用されます。

* **slot属性を持つ子要素はその値とマッチするname属性を持つslot要素にレンダリングされます。**

  例: `<p slot="one">...</p>`は`<slot name="one"></slot>`にのみ置き換えられます。

```html
<my-element>
  <p slot="two">Include me in slot "two".</p>
</my-element>

<hr>

<my-element>
  <p slot="one">Include me in slot "one".</p>
  <p slot="nope">This one will not render at all.</p>
  <p>No default slot, so this one won't render either.</p>
</my-element>
```

```ts
import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';

@customElement('my-element')
export class MyElement extends LitElement {
  protected render() {
    return html`
      <p>
        <slot name="one"></slot>
        <slot name="two"></slot>
      </p>
    `;
  }
}
```

### デフォルトでslotに適用されるコンテンツを指定する

slot要素に割り当てられるデフォルトのコンテンツを指定することができます。
slot要素に対応するコンテンツが存在しない場合、デフォルトのコンテンツは表示されます。

```html
<slot>I am fallback content</slot>
```

**デフォルトのコンテンツをレンダリングする**
子Nodeがslotに適用された場合、デフォルトのコンテンツはレンダリングされません。
name属性のないslot要素は任意の子Nodeを適用します。
It won't render fallback content even if the only assigned nodes are text nodes containing whitespace, for example `<example-element> </example-element>`.
When using a Lit expression as a child of a custom element, make sure to use a non-rendering value when appropriate so that any slot fallback content is rendered.
詳しくは[レンダリングしない値](https://japanese-document.github.io/lit/templates-expressions.html#子コンテンツの削除)を見てください。

## slotに適用された子要素にアクセスする

To access children assigned to slots in your shadow root, you can use the standard `slot.assignedNodes` or `slot.assignedElements` methods with the `slotchange` event.

For example, you can create a getter to access assigned elements for a particular slot:

```js
get _slottedChildren() {
  const slot = this.shadowRoot.querySelector('slot');
  return slot.assignedElements({flatten: true});
}
```

You can also use the `slotchange` event to take action when the assigned nodes change.
The following example extracts the text content of all of the slotted children.

```js
handleSlotchange(e) {
  const childNodes = e.target.assignedNodes({flatten: true});
  // ... do something with childNodes ...
  this.allText = childNodes.map((node) => {
    return node.textContent ? node.textContent : ''
  }).join('');
}

render() {
  return html`<slot @slotchange=${this.handleSlotchange}></slot>`;
}
```

詳しくは[HTMLSlotElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLSlotElement)を見てください。

### @queryAssignedElementsデコレータと@queryAssignedNodesデコレータ

`@queryAssignedElements` and `@queryAssignedNodes` convert a class property into a getter that returns the result of calling
[`slot.assignedElements`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLSlotElement/assignedElements) or [`slot.assignedNodes`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLSlotElement/assignedNodes) respectively on a given slot in the component's shadow tree.
Use these to query the elements or nodes assigned to a given slot.

Both accept an optional object with the following properties:

| Property       | Description                                                             |
| -------------- | ----------------------------------------------------------------------- |
| `flatten` | Boolean specifying whether to flatten the assigned nodes by replacing any child `<slot>` elements with their assigned nodes. |
| `slot` | Slot name specifying the slot to query. Leave undefined to select the default slot. |
| `selector` (`queryAssignedElements` only) | If specified, only return assigned elements that match this CSS selector. |

Deciding which decorator to use depends on whether you want to query for text nodes assigned to the slot, or only element nodes. This decision is specific to your use case.

<div class="alert alert-info">

**Using decorators.** Decorators are a proposed JavaScript feature, so you’ll need to use a compiler like Babel or TypeScript to use decorators. See [Using decorators](/docs/components/decorators/) for details.

</div>

```ts
@queryAssignedElements({slot: 'list', selector: '.item'})
_listItems!: Array<HTMLElement>;

@queryAssignedNodes({slot: 'header', flatten: true})
_headerNodes!: Array<Node>;
```

The examples above are equivalent to the following code:

```js
get _listItems() {
  const slot = this.shadowRoot.querySelector('slot[name=list]');
  return slot.assignedElements().filter((node) => node.matches('.item'));
}

get _headerNodes() {
  const slot = this.shadowRoot.querySelector('slot[name=header]');
  return slot.assignedNodes({flatten: true});
}
```

## render rootを変更する

Each Lit component has a **render root**—a DOM node that serves as a container for its internal DOM.

By default, LitElement creates an open `shadowRoot` and renders inside it, producing the following DOM structure:

```html
<my-element>
  #shadow-root
    <p>child 1</p>
    <p>child 2</p>
```

There are two ways to customize the render root used by LitElement:

* Setting `shadowRootOptions`.
* Implementing the `createRenderRoot` method.

### `shadowRootOptions`を変更する

The simplest way to customize the render root is to set the `shadowRootOptions` static property. The default implementation of `createRenderRoot` passes `shadowRootOptions` as the options argument to `attachShadow` when creating the component's shadow root. It can be set to customize any options allowed in the [ShadowRootInit](https://developer.mozilla.org/en-US/docs/Web/API/Element/attachShadow#parameters) dictionary, for example `mode` and `delegatesFocus`.

```js
class DelegatesFocus extends LitElement {
  static shadowRootOptions = {...LitElement.shadowRootOptions, delegatesFocus: true};
}
```

See [Element.attachShadow()](https://developer.mozilla.org/en-US/docs/Web/API/Element/attachShadow) on MDN for more information.

### `createRenderRoot`を実装する

The default implementation of `createRenderRoot` creates an open shadow root and adds to it any styles set in the `static styles` class field. For more information on styling see [Styles](/docs/components/styles/).

To customize a component's render root, implement `createRenderRoot` and return the node you want the template to render into.

For example, to render the template into the main DOM tree as your element's children, implement `createRenderRoot` and return `this`.

<div class="alert alert-info">

**Rendering into children.** Rendering into children and not shadow DOM is generally not recommended. Your element will not have access to DOM or style scoping, and it will not be able to compose elements into its internal DOM.

</div>

{% playground-ide "docs/components/shadowdom/renderroot/" %}

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