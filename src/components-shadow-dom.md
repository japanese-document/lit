{ "header": {"name": "コンポーネント", "order": 0}, "order": 5 }
---
# Shadow DOM

LitコンポーネントはDOMをカプセル化するために[Shadow DOM](https://developers.google.com/web/fundamentals/web-components/shadowdom)を使います。
Shadow DOMを使うとコンポーネントにdocumentとは別箇でカプセル化されたDOMツリーを追加することができます。
DOMのカプセル化はページ内で動作する(Web componentsやLitコンポーネントを含む)他のコードとの相互運用性を実現するための重要な要素です。

Shadow DOMには下記の利点があります。

* DOMの公開範囲を限定します。`document.querySelector`のようなDOM APIはコンポーネントのShadow DOMを見つけません。これはグローパルスクリプトが意図せずコンポーネントを破壊する可能性を低減します。
* スタイルの適用範囲を限定します。Shadow DOMによってカプセル化されたスタイルはDOMツリーの属する他のDOMに影響を与えません。
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
これは`@queryAsync`によって返されるNodeが他のプロパティの変更に影響を受ける場合に便利です。

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
`<example-element> </example-element>`の様に子Nodeがスペースだけの場合でもデフォルトのコンテンツはレンダリングされません。
custom elementの子要素にLitエクスプレッションを使う場合、
意図した通りにデフォルトのコンテンツがレンダリングされるようにレンダリングしない値を使ってください。
詳しくは[レンダリングしない値](https://japanese-document.github.io/lit/templates-expressions.html#子コンテンツの削除)を見てください。

## slotに適用された子要素にアクセスする

shadow root内のslotに割り当てられた子要素にアクセスするには、
[slotchange](https://developer.mozilla.org/en-US/docs/Web/API/HTMLSlotElement/slotchange_event)イベントでWeb標準の`slot.assignedNodes`メソッドもしくは`slot.assignedElements`メソッドを使います。

下記のように、特定のslotに割り当てられた要素を返すゲッタを作成することができます。

```js
get _slottedChildren() {
  const slot = this.shadowRoot.querySelector('slot');
  return slot.assignedElements({flatten: true});
}
```

`slotchange`イベントを使うとslotに割り当てられたNodeが変更された時に処理を実行することができます。
下記の例では、すべてのslotに割り当てられた要素のテキストコンテンツを取得しています。

```js
handleSlotchange(e) {
  const childNodes = e.target.assignedNodes({flatten: true});
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

`@queryAssignedElements`はクラスのプロパティを指定したslotの[`slot.assignedElements`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLSlotElement/assignedElements)を返すgetterに変換します。
`@queryAssignedNodes`はクラスのプロパティを指定したslotの[`slot.assignedNodes`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLSlotElement/assignedNodes)を返すgetterに変換します。
これらのクエリを使ってslotに割り当てられた要素もしくはNodeを取得します。

これら2つのデコレータにオプションで下記のプロパティを持つobjectを渡すことができます。

| プロパティ       | 説明                                                             |
| -------------- | ----------------------------------------------------------------------- |
| `flatten` | `slot.assignedElements`と`slot.assignedNodes`の引数の`flatten` |
| `slot` | クエリの対象となるslot要素のname属性を指定します。何も指定しない場合はデフォルトのslotになります。 |
| `selector` (`queryAssignedElements`のみ) | CSSセレクタを指定します。そのセレクタにマッチした要素のみ返します。 |

両者の違いは結果に要素のみが含まれるかそれに加えてテキストNodeが含まれるかです。
どちらを使うかはユースケースによります。

```ts
@queryAssignedElements({slot: 'list', selector: '.item'})
_listItems!: Array<HTMLElement>;

@queryAssignedNodes({slot: 'header', flatten: true})
_headerNodes!: Array<Node>;
```

上記のコードは下記と等価です。

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

各Litコンポーネントはrender rootを保有しています。
render rootはコンポーネント内のDOMを内包しています。

デフォルトでは、LitElementは[open](https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot/mode)モードの`shadowRoot`を生成します。そして、LitElementは`shadowRoot`の内側にレンダリングします。その結果、下記のようなDOM構造を生成します。

```html
<my-element>
  #shadow-root
    <p>child 1</p>
    <p>child 2</p>
```

LitElementでrender rootを変更する方法は下記の2つです。

* `shadowRootOptions`を設定する方法
* `createRenderRoot`メソッドを実装する方法

### `shadowRootOptions`を設定する

render rootを変更する一番シンプルな方法は`static shadowRootOptions`プロパティを変更することです。
デフォルトの`createRenderRoot`の実装は、コンポーネントのshadow rootを作成する際に`attachShadow`に`static shadowRootOptions`プロパティを引数として渡します。
だから、`static shadowRootOptions`プロパティを変更することで`mode`や`delegatesFocus`等の設定を変更することができます。

```js
class DelegatesFocus extends LitElement {
  static shadowRootOptions = {...LitElement.shadowRootOptions, delegatesFocus: true};
}
```

詳しくは[Element.attachShadow()](https://developer.mozilla.org/en-US/docs/Web/API/Element/attachShadow)を見てください。

### `createRenderRoot`を実装する

デフォルトの`createRenderRoot`の実装はopen modeのshadow rootを作成します。そして、`static style`クラスフィールドにセットされているスタイルをそれに加えます。
詳しくは[スタイル](https://japanese-document.github.io/lit/components-styles.html)を見てください。

コンポーネントのrender rootを変更するには、`createRenderRoot`がテンプレートをレンダリングした結果を内包するNodeを返すように実装します。

例えば、テンプレートを要素の子要素としてメインのDOMツリーにレンダリングする(shadow domではなく通常のDOMとしてレンダリングする)には、`createRenderRoot`が`this`を返すように実装します。

shadow domではなく通常のDOMとしてレンダリングすることは非推奨です。

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