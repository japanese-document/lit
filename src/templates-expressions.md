{ "header": {"name": "Templates", "order": 1}, "order": 0 }
---
# Expressions

Litテンプレートはエクスプレッション(expressions)と呼ばれる動的な値を`${...}`の形式で埋め込むことができます。
エクスプレッションをJavaScriptの[式](https://developer.mozilla.org/ja/docs/Web/JavaScript/Guide/Expressions_and_Operators#%E5%BC%8F)にすることもできます。
エクスプレッションはテンプレートが評価されるときに評価されます。そして、その結果はテンプレートのレンダリング結果に影響を与えます。
Litコンポーネントは`render`メソッドを実行する毎にこれをします。

エクスプレッションはテンプレートの特定の場所にのみ配置することができます。
エクスプレッションがどう解釈されるかは、それがある場所で決まります。
要素タグ内にあるエクスプレッションはその要素に影響を与えます。
要素のコンテンツ内にあるエクスプレッションは子Nodeと同じような位置で子Nodeやテキストをレンダリングします。

エクスプレッションの値が有効かどうかはエクスプレッションの位置によって異なります。
一般的に全てのエクスプレッションは文字列や数値などのプリミティブな値を受け入れます。そして、いくつかのエクスプレッションはそれに加えていくつかの型をサポートします。
それに加えて、全てのエクスプレッションはディレクティブを受け入れることができます。
ディレクディブはエクスプレッションはの処理を変更してレンダリングする特別な関数です。
詳しくは[カスタムディレクティブ](https://lit.dev/docs/templates/custom-directives/)を見てください。

以下に各エクスプレッションタイプのクイックリファレンスと詳しい説明へのリンクを記載します。


* [Child nodes](#Child_expressions)

```js
html`
<h1>Hello ${name}</h1>
<ul>
  ${listItems}
</ul>`
```

* [Attributes](#Attribute_expressions)


```js
html`<div class=${highlightClass}></div>`
```

* [Boolean Attributes](#Boolean_attribute_expressions)

```js
html`<div ?hidden=${!show}></div>`
```

* [Properties](#Property_expressions)

```js
html`<input .value=${value}>`
```

* [Event listeners](#Event_listener_expressions)

```js
html`<button @click=${this._clickHandler}>Go</button>`
```

* [Element directives](#Element_expressions)

```js
html`<input ${ref(inputRef)}>`
```

以下のセクションで各エクスプレッションの詳しい説明をします。
テンプレートの構造のより詳しい説明は[Well-formed HTML](#Well-formed_HTML)と[Valid expression locations](#Valid_expression_locations)を見てください。

## Child expressions

要素のタグの始まりと終わりの間にあるエクスプレッションは要素に子Nodeを加えます。例えば、

```js
html`<p>Hello, ${name}</p>`
```

もしくは、

```js
html`<main>${bodyText}</main>`
```

この位置にあるエクスプレッションは以下の値を受け入れることができます。

*   string、number、boolean等のプリミティブ値
*   `html`関数で生成される`TemplateResult`オブジェクト
*   `svg`関数で生成される`SVGTemplateResult`オブジェクト
*   DOM Nodes
*   センチネル値([`nothing`](https://japanese-document.github.io/lit/api-templates.html#nothing__symbol)と[`noChange`](https://lit.dev/docs/emplates/custom-directives/#signaling-no-change))
*   サポートされている型の配列もしくはiterables

### プリミティブ値

Litはほとんどすべての[プリミティブ値](https://developer.mozilla.org/en-US/docs/Glossary/Primitive)をレンダリングすることができます。 
そして、テキストコンテントに挿入される場合はそれらを文字列に変換します。

`5`のような数値は`'5'`の文字列にレンダリングされます。
Bigintも同様に扱われます。

booleanは`true`は`'true'`にレンダリングされます。`false`は`'false'`にレンダリングされます。でも、ふつうはbooleanでこういうことはしません。
通常、booleanは条件として使われるます。詳しくは[Conditionals](https://lit.dev/docs/templates/conditionals/)見てください。

空文字(`''`)、`null`、`undefined`は特別な意味を持ちます。
そして、それらは何もレンダリングしません。
詳しくは[子コンテンツの削除](#子コンテンツの削除)を見てください。

`Symbol`は文字列に変換されません。child expressionに置かれた場合、例外が発生します。

### センチネル値

Litはchild expressionに使うことができるいくつかの特別なセンチネル値を提供します。

`noChange`センチネル値はエクスプレッションの既存の値を変更しません。
これは通常、カスタムディレクティブで使われます。
詳しくは[Signaling no change](https://lit.dev/docs/templates/custom-directives/#signaling-no-change)を見てください。

`nothing`センチネルは何もレンダリングしません。
詳しくは[子コンテンツの削除](#子コンテンツの削除)を見てください。

### Templates

エクスプレッション内に`TemplateResult`を返すエクスプレッションを配置することができるので、テンプレートをネストしたり組み合わせたりすることができます。

```js
const nav = html`<nav>...</nav>`;
const page = html`
  ${nav}
  <main>...</main>
`;
```

これは素のJavaScriptを使って条件分岐のあるテンプレートや繰り返しがあるテンプレート等を生成することができることを意味します。

```js
html`
  ${this.user.isloggedIn
      ? html`Welcome ${this.user.name}`
      : html`Please log in`
  }
`;
```

条件分岐のあるテンプレートに関する詳しい説明は[Conditionals](https://lit.dev/docs/templates/conditionals/)にあります。

繰り返しがあるテンプレートに関する詳しい説明は[Lists](https://lit.dev/docs/templates/lists/)にあります。

### DOM nodes

DOM Nodeはchild expressionに渡すことができます。
通常、DOM Nodeは`html`を使ったテンプレートを記述することでレンダリングされます。
しかし、必要な時は下記のようにDOM Nodeを直接レンダリングすることができます。
この時、現在の親Nodeから削除されて、NodeはDOMツリーに取り付けられます。

```js
const div = document.createElement('div');
const page = html`
  ${div}
  <p>This is some text</p>
`;
```

### サポートされている型の配列もしくはiterables

エクスプレッションはサポートされている型を格納する配列、iterable、それらの組み合わせを返すことができます。
つまり、`Array.map()`を使って繰り返し表現を生成することができます。
詳しくは[リスト](https://lit.dev/docs/templates/lists/)を見てください。

### 子コンテンツの削除

`null`、`undefined`、空文字列(`''`)、Litの[nothing](https://japanese-document.github.io/lit/api-templates.html#nothing__symbol)センチネル値は、1つ前のレンダリングされたコンテンツを削除します。そして、Nodeをレンダリングしません。

子コンテンツのセットもしくは削除はよく条件分岐によって行われます。
詳しくは[Conditionally rendering nothing](https://lit.dev/docs/templates/conditionals/#conditionally-rendering-nothing)を見てください。

Rendering no node can be important when an expression is a child of an element with Shadow DOM that includes a `slot` with fallback content.
Rendering no node ensures the fallback content is rendered.
See [fallback content](https://lit.dev/docs/components/shadow-dom/#fallback) for more information.

## Attribute expressions

In addition to using expressions to add child nodes, you can use them to set an elements's attributes and properties, too.

By default, an expression in the value of an attribute sets the attribute:

```js
html`<div class=${this.textClass}>Stylish text.</div>`;
```

Since attribute values are always strings, the expression should return a value that can be converted into a string.

If the expression makes up the entire attribute value, you can leave off the quotes. If the expression makes up only part of the attribute value, you need to quote the entire value:

```js
html`<img src="/images/${this.image}">`;
```

Note, some primitive values are handled specially in attributes. Boolean values are converted to strings so, for example, `false` renders `'false'`. Both `undefined` and `null` render to an attribute as an empty string.

### Boolean attributes

To set a boolean attribute, use the `?` prefix with the attribute name. The attribute is added if the expression evaluates to a truthy value, removed if it evaluates to a falsy value:

```js
html`<div ?hidden=${!this.showAdditional}>This text may be hidden.</div>`;
```

### Removing an attribute

Sometimes you want to set an attribute only under certain conditions, and otherwise remove the attribute. For common "boolean attributes" like `disabled` and `hidden` where you want to set the attribute to an empty string for a truthy value and remove it otherwise, use a [boolean attribute](#boolean-attribute-expressions). Sometimes, however, you might require a different condition for adding or removing an attribute. 

For example, consider:

```js
html`<img src="/images/${this.imagePath}/${this.imageFile}">`;
```

If `this.imagePath` or `this.imageFile` is not defined, the `src` attribute should not be set or an invalid network request will occur.

Lit's [nothing](https://lit.dev/docs/api/templates/#nothing) sentinel value addresses this by removing the attribute when any expression in the attribute value evaluates to `nothing`.

```js
html`<img src="/images/${this.imagePath ?? nothing}/${this.imageFile ?? nothing}">`;
```

In this example **both** the `this.imagePath` and `this.imageFile` properties must be defined for the `src` attribute to be set. The `??` [nullish coalescing operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing_operator) returns the right-hand value if the left-hand value is `null` or `undefined`.

Lit also provides an [ifDefined](https://lit.dev/docs/api/directives/#ifDefined) directive which is sugar for `value ?? nothing`.

```js
html`<img src="/images/${ifDefined(this.imagePath)}/${ifDefined(this.imageFile)}">`;
```

You might also want to remove the attribute if the value is not truthy so that values of `false` or empty string `''` remove the attribute. For example, consider an element that has default value for `this.ariaLabel` of empty string `''`:

```js
html`<button aria-label="${this.ariaLabel || nothing}"></button>`
```

In this example the `aria-label` attribute is rendered only if `this.ariaLabel` is not an empty string.

Setting or removing an attribute is often done based on a condition. See [Conditionally rendering nothing](https://lit.dev/docs/templates/conditionals/#conditionally-rendering-nothing) for more information.

## Property expressions

You can set a JavaScript property on an element using the `.` prefix and the property name:

```js
html`<input .value=${this.itemCount}>`;
```

You can use this syntax to pass complex data down the tree to subcomponents. For example, if you have a `my-list` component with a `listItems` property, you could pass it an array of objects:

```js
html`<my-list .listItems=${this.items}></my-list>`;
```

Note that the property name in this example—`listItems`—is mixed case. Although HTML *attributes* are case-insensitive, Lit preserves the case for property names when it processes the template.

For more information about component properties, see [Reactive properties](https://lit.dev/docs/components/properties/).

## Event listener expressions

Templates can also include declarative event listeners. Use the prefix `@` followed by the event name. The expression should evaluate to an event listener.

```js
html`<button @click=${this.clickHandler}>Click Me!</button>`;
```

This is similar to calling `addEventListener('click', this.clickHandler)` on the button element.

The event listener can be either a plain function, or an object with a `handleEvent` method — the same as the `listener` argument to the standard [`addEventListener`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener) method.

In a Lit component, the event listener is automatically bound to the component, so you can use the `this` value inside the handler to refer to the component instance.

```js
clickHandler() {
  this.clickCount++;
}
```

For more information about component events, see [Events](https://lit.dev/docs/components/events/).

## Element expressions

You can also add an expression that accesses an element instance, instead of a single property or attribute on an element:

```js
html`<div ${myDirective()}></div>`
```

Element expressions only work with [directives](https://lit.dev/docs/templates/directives/). Any other value type in an element expression is ignored.

One built-in directive that can be used in an element expression is the `ref` directive. It provides a reference to the rendered element.

```js
html`<button ${ref(this.myRef)}`;
```

See [ref](https://lit.dev/docs/templates/directives/#ref) for more information.

## Well-formed HTML

Lit templates must be well-formed HTML. The templates are parsed by the browser's built-in HTML parser before any values are interpolated. Follow these rules for well-formed templates:

 *  Templates must be well-formed HTML when all expressions are replaced by empty values.

 *  Templates can have multiple top-level elements and text.

 *  Templates _should not contain_ unclosed elements—they will be closed by the HTML parser.

    ```js
    // HTML parser closes this div after "Some text"
    const template1 = html`<div class="broken-div">Some text`;
    // When joined, "more text" does not end up in .broken-div
    const template2 = html`${template1} more text. </div>`;
    ```

<div class="alert alert-info">

Because the browser's built-in parser is very lenient, most cases of malformed templates are not detectable at runtime, so you won't see  warnings—just templates that don't behave as you expect. We recommend using <a href="/docs/tools/development/#linting">linting tools</a> and <a href="/docs/tools/development/#ide-plugins">IDE plugins</a> to find issues in your templates during development.

</div>

## Valid expression locations

Expressions **_can only occur_** where you can place attribute values and child elements in HTML.

```html
<!-- attribute values -->
<div label=${label}></div>
<button ?disabled=${isDisabled}>Click me!</button>
<input .value=${currentValue}>
<button @click=${this.handleClick()}>

<!-- child content -->
<div>${textContent}</div>
```

Element expressions can occur inside the opening tag after the tag name:

```html
<div ${ref(elementReference)}></div>
```

### Invalid locations

Expressions should generally not appear in the following locations:

* Where tag or attribute names would appear. Lit does not support dynamically changing values in this position and will error in development mode.

  ```html
  <!-- ERROR -->
  <${tagName}></${tagName}>

  <!-- ERROR -->
  <div ${attrName}=true></div>
  ```

* Inside `<template>` element content (attribute expressions on the template element itself are allowed). Lit does not recurse into template content to dynamically update expressions and will error in development mode.

  ```html
  <!-- ERROR -->
  <template>${content}</template>

  <!-- OK -->
  <template id="${attrValue}">static content ok</template>
  ```

* Inside `<textarea>` element content (attribute expressions on the textarea element itself are allowed). Note that Lit can render content into textarea, however editing the textarea will break references to the DOM that Lit uses to dynamically update, and Lit will warn in development mode. Instead, bind to the `.value` property of textarea.
  ```html
  <!-- BEWARE -->
  <textarea>${content}</textarea>

  <!-- OK -->
  <textarea .value=${content}></textarea>

  <!-- OK -->
  <textarea id="${attrValue}">static content ok</textarea>
  ```

* Similarly, inside elements with the `contenteditable` attribute. Instead, bind to the `.innerText` property of the element.
  ```html
  <!-- BEWARE -->
  <div contenteditable>${content}</div>

  <!-- OK -->
  <div contenteditable .innerText=${content}></div>

  <!-- OK -->
  <div contenteditable id="${attrValue}">static content ok</div>
  ```

* Inside HTML comments. Lit will not update expressions in comments, and the expressions will instead be rendered with a Lit token string. However, this will not break subsequent expressions, so commenting out blocks of HTML during development that may contain expressions is safe.
  ```html
  <!-- will not update: ${value} -->
  ```

* Inside `<style>` elements when using the ShadyCSS polyfill. See [Expressions and style elements](/docs/components/styles/#style-element) for more details.

Note that expressions in all the invalid cases above are valid when using [static expressions](#static-expressions), although these should not be used for performance-sensitive updates due to the inefficiencies involved (see below).

## Static expressions

Static expressions return special values that are interpolated into the template _before_ the template is processed as HTML by Lit. Because they become part of the template's static HTML, they can be placed anywhere in the template - even where expressions would normally be disallowed, such as in attribute and tag names.

To use static expressions, you must import a special version of the `html` or `svg` template tags from Lit's `static-html` module:

```ts
import {html, literal} from 'lit/static-html.js';
```

The `static-html` module contains `html` and `svg` tag functions which support static expressions and should be used instead of the standard versions provided in the `lit` module. Use the `literal` tag function to create static expressions.

You can use static expressions for configuration options that are unlikely to change or for customizing parts of the template you cannot with normal expressions - see the section on [Valid expression locations](#expression-locations) for details. For example, a `my-button` component might render a `<button>` tag, but a subclass might render an `<a>` tag, instead. This is a good place to use a static expression because the setting does not change frequently and customizing an HTML tag cannot be done with a normal expression.

{% switchable-sample %}

```ts
import {LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {html, literal} from 'lit/static-html.js';

@customElement('my-button')
class MyButton extends LitElement {
  tag = literal`button`;
  activeAttribute = literal`active`;
  @property() caption = 'Hello static';
  @property({type: Boolean}) active = false;

  render() {
    return html`
      <${this.tag} ${this.activeAttribute}?=${this.active}>
        <p>${this.caption}</p>
      </${this.tag}>`;
  }
}
```

```js
import {LitElement} from 'lit';
import {html, literal} from 'lit/static-html.js';

class MyButton extends LitElement {
  static properties = {
    caption: {},
    active: {type: Boolean},
  };

  tag = literal`button`;
  activeAttribute = literal`active`;

  constructor() {
    super();
    this.caption = 'Hello static';
    this.active = false;
  }

  render() {
    return html`
      <${this.tag} ${this.activeAttribute}?=${this.active}>
        <p>${this.caption}</p>
      </${this.tag}>`;
  }
}
customElements.define('my-button', MyButton);
```

{% endswitchable-sample %}

{% switchable-sample %}

```ts
@customElement('my-anchor')
class MyAnchor extends MyButton {
  tag = literal`a`;
}
```

```js
class MyAnchor extends MyButton {
  tag = literal`a`;
}
customElements.define('my-anchor', MyAnchor);
```

{% endswitchable-sample %}

<div class="alert alert-warning">

**Changing the value of static expressions is expensive.** Expressions using `literal` values should not change frequently, as they cause a new template to be re-parsed and each variation is held in memory.

</div>

In the example above, if the template re-renders and `this.caption` or `this.active` change, Lit updates the template efficiently, only changing the affected expressions. However, if `this.tag` or `this.activeAttribute` change, since they are static values tagged with `literal`, an entirely new template is created; the update is inefficient since the DOM is completely re-rendered. In addition, changing `literal` values passed to expressions increases memory use since each unique template is cached in memory to improve re-render performance.

For these reasons, it's a good idea keep changes to expressions using `literal` to a minimum and avoid using reactive properties to change `literal` values, since reactive properties are intended to change.

### Template structure

After static values have been interpolated, the template must be well-formed like normal Lit templates, otherwise the dynamic expressions in the template might not function properly. See the [Well-formed HTML](#well-formed-html) section for more information.

### Non-literal statics

In rare cases, you may need to interpolate static HTML into a template that is not defined in your script, and thus cannot be tagged with the `literal` function. For these cases, the `unsafeStatic()` function can be used to create static HTML based on strings from non-script sources.

```ts
import {html, unsafeStatic} from 'lit/static-html.js';
```

<div class="alert alert-warning">

**Only for trusted content.** Note the use of _unsafe_ in `unsafeStatic()`. The string passed to `unsafeStatic()` must be developer-controlled and not include untrusted content, because it will be parsed directly as HTML with no sanitization. Examples of untrusted content include query string parameters and values from user inputs. Untrusted content rendered with this directive could lead to [cross-site scripting (XSS)](https://en.wikipedia.org/wiki/Cross-site_scripting) vulnerabilities.

</div>

{% switchable-sample %}

```ts
@customElement('my-button')
class MyButton extends LitElement {
  @property() caption = 'Hello static';
  @property({type: Boolean}) active = false;

  render() {
    // These strings MUST be trusted, otherwise this is an XSS vulnerability
    const tag = getTagName();
    const activeAttribute = getActiveAttribute();
    return html`
      <${unsafeStatic(tag)} ${unsafeStatic(activeAttribute)}?=${this.active}>
        <p>${this.caption}</p>
      </${unsafeStatic(tag)}>`;
  }
}
```

```js
class MyButton extends LitElement {
  static properties = {
    caption: {},
    active: {type: Boolean},
  };

  constructor() {
    super();
    this.caption = 'Hello static';
    this.active = false;
  }

  render() {
    // These strings MUST be trusted, otherwise this is an XSS vulnerability
    const tag = getTagName();
    const activeAttribute = getActiveAttribute();
    return html`
      <${unsafeStatic(tag)} ${unsafeStatic(activeAttribute)}?=${this.active}>
        <p>${this.caption}</p>
      </${unsafeStatic(tag)}>`;
  }
}
customElements.define('my-button', MyButton);
```

{% endswitchable-sample %}

Note that the behavior of using `unsafeStatic` carries the same caveats as `literal`: because changing values causes a new template to be parsed and cached in memory, they should not change frequently.

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