{ "header": {"name": "コンポーネント", "order": 0}, "order": 3 }
---
# スタイル

コンポーネントのテンプレートは[shadow root](https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot)にレンダリングされます。
コンポーネントに追加されたスタイルは自動的にshadow root内にスコープされます。
つまり、そのスタイルはコンポーネントのshadow root内の要素にのみ影響を与えます。

[Shadow DOM](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM)によってスタイルのカプセル化がされます。
LitがShadow DOMを使わなかった場合、コンポーネントの外側にある要素(親要素や子要素も含む)に誤ってスタイルを適用にしないように注意する必要があります。
そのためにクラス名を長くて面倒な物にしないといけないかもしれません。
Shadow DOMを使うことによって、
Litはコンポーネントにセレクタ記述したセレクタをすべてコンポーネントのshadow root内の要素にのみ適用します。

## コンポーネントにスタイルを加える

`static styles`クラスフィールドに`css`タグ関数を付けでCSSを記述することで適用範囲が限定されているスタイルを定義します。
この方法でスタイルを定義することでパフォーマンスが最適化されます。

```ts
import {LitElement, html, css} from 'lit';
import {customElement} from 'lit/decorators.js';

@customElement('my-element')
export class MyElement extends LitElement {
  static styles = css`
    p {
      color: green;
    }
  `;
  protected render() {
    return html`<p>I am green!</p>`;
  }
}
```

コンポーネントに追加されたスタイルはShadow DOMによって適用範囲が限定されます。
概要は[Shadow DOM](#Shadow_DOM)を見てください。

`static styles`クラスフィールドを下記のように記述します。

* タグが付いたテンプレート1つ

    ```js
    static styles = css`...`;
    ```

* タグが付いたテンプレートの配列

    ```js
    static styles = [ css`...`, css`...`];
    ```

ほとんどの場合、`static styles`クラスフィールドを使う方法はコンポーネントのスタイルを定義するベストプラクティスです。
インスタンス毎にスタイルを変更するようなユースケースでは、この方法では達成することができません。
スタイルを追加する別の方法は[テンプレート内で適用範囲が限定されているスタイルを定義する](#テンプレート内で適用範囲が限定されているスタイルを定義する)を見てください。

### static styles内でエクスプレッションを使う

`static styles`はコンポーネントクラスのすべてのインスタンスに適用されます。
cssタグ内のエクスプレッションは一度だけ評価されます。そして、それらはすべてのインスタンスに使われます。

DOMツリー毎もしくはインスタンス毎のスタイルの変更は[CSSカスタムプロパティ](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)を使って要素に[テーマ](#テーマ)を適用できるようにします。

Litコンポーネントが悪意のあるコードを実行する可能性を排除するために、
`css`タグは下記のようにエクスプレッションにcssタグが付与された文字列または数値のみを受け付けます。

```js
const mainColor = css`red`;
const fontSize = 20;
...
static styles = css`
  div { color: ${mainColor}; font-size: ${fontSize}px; }
`;
```

この制限はURLパラメータやデータベースの値のような信頼できない所から取得した悪意のあるスタイルやコードを埋め込むことによるセキュリティ面の脆弱性からアプリケーションを保護するための物です。

あなた自身で定義した定数のように信頼できる値の場合、下記のように値を`unsafeCSS`関数に渡してエクスプレッションにセットすることができます。

```js
const mainColor = 'red';
...
static styles = css`
  div { color: ${unsafeCSS(mainColor)} }
`;
```

サニタイズされていないCSSを挿入することはセキュリティリスクになるので、
`unsafeCSS`関数には信頼できる入力のみ渡します。

### スーパークラスのスタイルを継承する 

下記のようにコンポーネントはタグ付けされたテンプレートリテラルの配列を使うことで、スーパークラスのスタイルを継承して、それ自身のスタイルを追加することができます。

```ts
import {LitElement, html, css, CSSResultGroup} from 'lit';
import {customElement} from 'lit/decorators.js';

@customElement('super-element')
export class SuperElement extends LitElement {
  static styles = css`
    div {
      border: 1px solid gray;
      padding: 8px;
    }
  ` as CSSResultGroup;
  protected render() {
    return html`
      <div>Content</div>
    `;
  }
}

@customElement('my-element')
export class MyElement extends SuperElement {
  static styles = [
    SuperElement.styles,
    css`div {
      color: red;
    }`
  ];
}
```

JavaScriptでは`super.styles`でスーパークラスの`styles`プロパティを参照することができます。
TypeScriptを使う場合、
コンパイラが常に正しく`super.styles`を変換するとは限らないので`super.styles`を使わないことを推奨します。
この問題を避けるために上記の例のように明示的にスーパークラスの`styles`プロパティを参照します。

TypeScriptでサブクラスに継承されることを意図したコンポーネントを記述する場合は、
`static styles`フィールドに`CSSResultGroup`型を指定します。これによって、`styles`を配列でオーバーライドできるようになり柔軟になります。

```ts
// TypeScriptが`styles`の型を`CSSResult`に限定することを防ぎます。
// これでサブクラスが`[SuperElement.styles, css`...`]`のような値をセットすることができます。
static styles: CSSResultGroup = css`...`;
```

### スタイルを共有する

タグ付けされたスタイルをexportしたモジュールを作成することによってコンポーネント間でスタイルを共有することができます。

```js
export const buttonStyles = css`
  .blue-button {
    color: white;
    background-color: blue;
  }
  .blue-button:disabled {
    background-color: grey;
  }`;
```

下記のようにスタイルをimportして`static styles`クラスフィールドにスタイルを追加することができます。

```js
import { buttonStyles } from './button-styles.js';

class MyElement extends LitElement {
  static styles = [
    buttonStyles,
    css`
      :host { display: block;
        border: 1px solid black;
      }`
  ];
}
```

### スタイルでUnicodeエスケープを使う

CSSのUnicodeエスケープシーケンスはバックスラッシュの後に4桁もしくは6桁の16進数の数字の文字列です。
例えば、"•"は`\2022`です。
これはJavaScriptで非推奨の8進数のエスケープシーケンスのフォーマットに該当します。
これらのシーケンスを`css`がタグ付けされたテンプレートリテラルで使うとエラーが発生します。

スタイルにUnicodeエスケープを加える方法は下記の2つです。

* 2つ目のバックスラッシュを加えます (例: `\\2022`)。
* 先頭に`\u`を付けてJavaScriptのエスケープシーケンスを使います (例: `\u2022`)。

```js
static styles = css`
  div::before {
    content: '\u2022';
  }
```

## Shadow DOM

このセクションではShadow DOMにスタイルを設定する方法を説明します。

コンポーネントに追加したスタイルは以下のコンポーネントの3つの部分に影響を与えます。

* [Shadow tree](#Shadow_treeのスタイルを設定する) (コンポーネントがテンプレートをレンダリングした物)
* [コンポーネント自身](#コンポーネント自身のスタイルを設定する)
* [子要素](#子要素のスタイルを設定する)


### Shadow treeのスタイルを設定する

デフォルトでLitはテンプレートをShadow tree内にレンダリングします。
要素の[shadow tree](https://developer.mozilla.org/en-US/docs/Glossary/Shadow_tree)に適用範囲を限定したスタイルはメインdocumentおよび他のshadow treeに影響を与えません。
同様に[継承されるCSSプロパティ](#CSSを継承する)を除いて、document内のスタイルはshadow tree内のコンテンツに影響を与えません。

`static styles`で標準のCSSセレクタを使うと、コンポーネントのshadow tree内の要素のみマッチします。
これによって、意図せずページ内の要素にスタイルが適用されることを憂慮しなくてもよくなるので、シンプルなセレクタ(例: `input`、`*`、`#my-element`)を多用することができます。

### コンポーネント自身のスタイルを設定する

特別なセレクタである`:host`を使うと、コンポーネント自身のスタイルを設定することができます。
(shadow treeを所有する要素をhost elementと呼びます。)

[:host](https://developer.mozilla.org/en-US/docs/Web/CSS/:host) CSS pseudo-classもしくは[:host()](https://developer.mozilla.org/en-US/docs/Web/CSS/:host_function) CSS pseudo-class関数を使うと、host elementのデフォルトのスタイルをセットすることができます。

* `:host`はhost elementに対応します。
* `:host(selector)`は`selector`セレクタにマッチするhost elementのみに対応します。

```ts
import {LitElement, html, css} from 'lit';
import {customElement} from 'lit/decorators/custom-element.js';

@customElement('my-element')
export class MyElement extends LitElement {
  static styles = css`
    :host {
      display: block;
      background-color: lightgray;
      padding: 8px;
    }
    :host(.blue) {
      background-color: aliceblue;
      color: darkgreen;
    }
  `;
  protected render() {
    return html`Hello World`;
  }
}
```

host element自身のスタイルはshadow treeの外部から影響を受けることがあります。
例えば、下記のようなスタイルは`:host`および`:host()`で設定されたスタイルを上書きします。
つまり、`:host`および`:host()`で設定されたスタイルはデフォルトのスタイルと見なすことができます。

```css
my-element {
  display: inline-block;
}
```

### 子要素のスタイルを設定する

コンポーネントに(`<ul>`要素に`<li>`要素を配置するように)子コンポーネントを配置することができます。
子コンポーネントをレンダリングするには、テンプレートに1つまたは複数の`<slot>`を配置する必要があります。
詳しくは[slot要素を使って子コンポーネントをレンダリングする](https://lit.dev/docs/components/shadow-dom/#slots)を見てください。

`<slot>`を使ってshadow tree内でhost elementの子要素が配置される位置を指定します。

[::slotted()](https://developer.mozilla.org/en-US/docs/Web/CSS/::slotted) CSS pseudo-elementを使って`<slot>`と置き換わる要素を指定することができます。

* `::slotted(*)` すべての置き換わる要素にマッチします。
* `::slotted(p)` 置き換わる要素が`<p>`の場合、マッチします。
* `p ::slotted(*)` 置き換わる要素が`<p>`の子要素の場合、マッチします。

```ts
import {LitElement, html, css} from 'lit';
import {customElement} from 'lit/decorators.js';

@customElement('my-element')
export class MyElement extends LitElement {
  static styles = css`
    ::slotted(*) { font-family: Roboto; }
    ::slotted(p) { color: blue; }
    div ::slotted(*) { color: red; }
  `;
  protected render() {
    return html`
      <slot></slot>
      <div><slot name="hi"></slot></div>
    `;
  }
}
```

`::slotted()`でスタイルを設定することができる要素は`<slot>`と置き換わる要素のみであることに注意してください。

```html
<my-element>
  <div>Stylable with ::slotted()</div>
</my-element>

<my-element>
  <div><p>Not stylable with ::slotted()</p></div>
</my-element>
```

`::slotted()`で設定したスタイルは下記のように上書きすることができます。
つまり`::slotted()`で設定したスタイルはデフォルトのスタイルと見なすことができます。

```css
my-element > div {
  /* 置き換えられる子要素を外部のスタイルから対象にすることで::slotted()を使ってセットしたスタイルを上書きすることができます。 */
}
```

## テンプレート内で適用範囲が限定されているスタイルを定義する

パフォーマンスを最適化するために[`static styles`クラスフィールド](#コンポーネントにスタイルを加える)を使うことを推奨します。
しかし、Litテンプレートでスタイルを定義したい時もあるでしょう。
テンプレートで適用範囲が限定されたスタイルを加える方法は下記の2つです。

* [`<style>`要素](#style要素を使ってスタイルを定義する)を使ってスタイルを追加する。
* [外部のスタイルシート](#外部のスタイルシートをインポートする(非推奨))を使ってスタイルを追加する。(非推奨)

これらの方法はそれぞれ利点と欠点があります。

### style要素を使ってスタイルを定義する

通常、スタイルは[`static styles`クラスフィールド](#コンポーネントにスタイルを加える)に配置されます。
`static styles`クラスフィールドはクラス毎に1度のみ評価されます。
インスタンス毎にスタイルを設定する必要がある時もあるかもしれません。
For this, we recommend using CSS properties to create [themable elements](#テーマ).
Alternatively, you can also include `<style>` elements in a Lit template.
These are updated per instance.

```js
render() {
  return html`
    <style>
      /* updated per instance */
    </style>
    <div>template content</div>
  `;
}
```

<div class="alert alert-info">

**Limitations in the ShadyCSS polyfill around per instance styling.** Per instance styling is not supported using the ShadyCSS polyfill. See the [ShadyCSS limitations](https://github.com/webcomponents/polyfills/tree/master/packages/shadycss#limitations) for details.

</div>

#### Expressions and style elements

Using expressions inside style elements has some important limitations and performance issues.

```js
render() {
  return html`
    <style>
      :host {
        /* Warning: this approach has limitations & performance issues! */
        color: ${myColor}
      }
    </style>
    <div>template content</div>
  `;
}
```

<div class="alert alert-info">

**Limitations in the ShadyCSS polyfill around expressions.** Expressions in `<style>` elements won't update per instance in ShadyCSS, due to limitations of the ShadyCSS polyfill. In addition, `<style>` nodes may not be passed as expression values when using the ShadyCSS polyfill. See the [ShadyCSS limitations](https://github.com/webcomponents/polyfills/tree/master/packages/shadycss#limitations) for more information.

</div>

Evaluating an expression inside a `<style>` element is extremely inefficient. When any text inside a `<style>` element changes, the browser must re-parse the whole `<style>` element, resulting in unnecessary work.

To mitigate this cost, separate styles that require per-instance evaluation from those that don't.

```js
  static styles = css`/* ... */`;
  render() {
    const redStyle = html`<style> :host { color: red; } </style>`;
    return html`${this.red ? redStyle : ''}`

```

### 外部のスタイルシートをインポートする(非推奨)

While you can include an external style sheet in your template with a `<link>`, we do not recommend this approach. Instead, styles should be placed in the [static `styles` class field](#add-styles).

<div class="alert alert-info">

**External stylesheet caveats.**

*  The [ShadyCSS polyfill](https://github.com/webcomponents/polyfills/tree/master/packages/shadycss#limitations) doesn't support external style sheets.
*   External styles can cause a flash-of-unstyled-content (FOUC) while they load.
*   The URL in the `href` attribute is relative to the **main document**. This is okay if you're building an app and your asset URLs are well-known, but avoid using external style sheets when building a reusable element.

</div>

## Dynamic classes and styles

One way to make styles dynamic is to add expressions to the `class` or `style` attributes in your template.

Lit offers two directives, `classMap` and `styleMap`, to conveniently apply classes and styles in HTML templates.

For more information on these and other directives, see the documentation on [built-in directives](https://lit.dev/docs/templates/directives/).

To use `styleMap` and/or `classMap`:

1.  Import `classMap` and/or `styleMap`:

    ```js
    import { classMap } from 'lit/directives/class-map.js';
    import { styleMap } from 'lit/directives/style-map.js';
    ```

2.  Use `classMap` and/or `styleMap` in your element template:

{% playground-example "docs/components/style/maps" "my-element.ts" %}

See [classMap](https://lit.dev/docs/templates/directives/#classmap) and [styleMap](https://lit.dev/docs/templates/directives/#stylemap) for more information.

## テーマ

By using [CSS inheritance](#inheritance) and [CSS variables and custom properties](#customprops) together, it's easy to create themable elements. By applying css selectors to customize CSS custom properties, tree-based and per-instance theming is straightforward to apply. Here's an example:

```ts
import {LitElement, html, css} from 'lit';
import {customElement} from 'lit/decorators.js';

@customElement('my-element')
export class MyElement extends LitElement {
  static styles = css`
    :host {
      color: var(--my-element-text-color, black);
      background: var(--my-element-background-color, white);
      font-family: var(--my-element-font-family, Roboto);
      display: block;
      padding: 8px;
      margin: 8px;
    }
  `;
  protected render() {
    return html`<div>Hello World</div>`;
  }
}
```

### CSSを継承する

CSS inheritance lets parent and host elements propagate certain CSS properties to their descendants.

Not all CSS properties inherit. Inherited CSS properties include:

* `color`
* `font-family` and other `font-*` properties
* All CSS custom properties (`--*`)

See [CSS Inheritance on MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/inheritance) for more information.

You can use CSS inheritance to set styles on an ancestor element that are inherited by its descendants:

```html
<style>
html {
  color: green;
}
</style>
<my-element>
  #shadow-root
    Will be green
</my-element>
```

### CSS custom properties {#customprops}

All CSS custom properties (<code>--<var>custom-property-name</var></code>) inherit. You can use this to make your component's styles configurable from outside.

The following component sets its background color to a CSS variable. The CSS variable uses the value of `--my-background` if it's been set by a selector matching an ancestor in the DOM tree, and otherwise defaults to `yellow`:

```js
class MyElement extends LitElement {
  static styles = css`
    :host {
      background-color: var(--my-background, yellow);
    }
  `;
  render() {
    return html`<p>Hello world</p>`;
  }
}
```

Users of this component can set the value of `--my-background`, using the `my-element` tag as a CSS selector:

```html
<style>
  my-element {
    --my-background: rgb(67, 156, 144);
  }
</style>
<my-element></my-element>
```

`--my-background` is configurable per instance of `my-element`:

```html
<style>
  my-element {
    --my-background: rgb(67, 156, 144);
  }
  my-element.stuff {
    --my-background: #111111;
  }
</style>
<my-element></my-element>
<my-element class="stuff"></my-element>
```

See [CSS Custom Properties on MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/--*) for more information.

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