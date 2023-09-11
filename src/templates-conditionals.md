{ "header": {"name": "テンプレート", "order": 1}, "order": 1 }
---
# 条件

Litは通常のJavaScriptの表現を使うことができるので、
[conditional operators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Conditional_Operator)、関数の実行、`if`文や`switch`文のような標準のJavaScriptの制御機能を使って条件に応じてコンテンツをレンダリングすることができます。

JavaScriptの条件文を使ってネストしたテンプレートエクスプレッションを組み合わせることができます。
[テンプレートに変換した結果](https://lit.dev/docs/api/templates/#TemplateResult)を変数に保存してそれを別の場所で使うことができます。

## 三項演算子を使う

下記のように三項演算子を使って条件に応じてテンプレートを構築することができます。

```ts
render() {
  return this.userName
    ? html`Welcome ${this.userName}`
    : html`Please log in <button>Login</button>`;
}
```

## if文を使う

下記のようにif文を使って条件に応じてテンプレートを構築することができます。

```ts
render() {
  let message;
  if (this.userName) {
    message = html`Welcome ${this.userName}`;
  } else {
    message = html`Please log in <button>Login</button>`;
  }
  return html`<p class="message">${message}</p>`;
}
```

上記は下記のようにロジック部分を関数に分離することができます。

```ts
getUserMessage() {
  if (this.userName) {
    return html`Welcome ${this.userName}`;
  } else {
    return html`Please log in <button>Login</button>`;
  }
}
render() {
  return html`<p>${this.getUserMessage()}</p>`;
}
```

## cacheディレクティブを使ってDOMをキャッシュする

ほとんどの場合、JavaScriptの条件文で充分ですが、
複雑で大規模なテンプレートを切り替える場合、各テンプレートからDOMを再生成するコストを節約したいと思うでしょう。

そんな時は`cache`ディレクティブの出番です。
`cache`ディテクティブは切り替えられたレンダリングされていないテンプレートのDOMをキャッシュします。

```ts
render() {
  return html`${cache(this.userName ?
    html`Welcome ${this.userName}`:
    html`Please log in <button>Login</button>`)
  }`;
}
```

詳しくは[cacheディレクティブ](https://japanese-document.github.io/lit/templates-directives.html#cache)を見てください。

## 条件に応じて何もレンダリングしない

条件に応じて何もレンダリングしないことがあるでしょう。
This is commonly needed for child expressions and also sometimes needed in attribute expressions.

For child expressions, the values `undefined`, `null`, the empty string (`''`), and Lit's [nothing](https://japanese-document.github.io/lit/api-templates.html#nothing__symbol) sentinel value all render no nodes.
See [Removing child content](https://japanese-document.github.io/lit/templates-expressions.html#子コンテンツの削除) for more information.

This example renders a value if it exists, and otherwise renders nothing:

```ts
render() {
  return html`<user-name>${this.userName ?? nothing}</user-name>`;
}
```

For attribute expressions, Lit's [nothing](https://japanese-document.github.io/lit/api-templates.html#nothing__symbol) sentinel value removes the attribute. See [Removing an attribute](https://japanese-document.github.io/lit/templates-expressions.html#属性の削除) for more information.

This example conditionally renders the `aria-label` attribute:

```ts
html`<button aria-label="${this.ariaLabel || nothing}"></button>`
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