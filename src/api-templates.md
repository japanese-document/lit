{ "header": {"name": "API", "order": 3}, "order": 1 }
---
# テンプレート

## html(strings: TemplateStringsArray, values: Array<unknown>): [TemplateResult](https://japanese-document.github.io/lit/api-templates.html#type_TemplateResult)

### Import

```
import { html } from 'lit';
```


htmlタグはレンダリングされるDOMを抽象化した値(TemplateResult)を返します。
LitコンポーネントはLitテンプレートがレンダリングされるまで何も処理を行いません。
レンダリングする時、現行のレンダリングで使用したテンプレートが前回のレンダリング時に使用したものと同じ場合は要素を全部置き換えるのではなく差分のみ置き換えます。

```
const header = (title: string) => html`<h1>${title}</h1>`;
```

## nothing: symbol

### Import

```
import { nothing } from 'lit';
```

child expressionsでは、`undefined`、`null`、`''`、`nothing`はNodeをレンダリングしません。
(全部が同じ動作をします。)
attribute expressionsでは`nothing`は属性を削除しますが、`undefined`と`null`は空文字をレンダリングします。
`property expressions`では`nothing`は`undefined`になります。
`nothing`の動作は他と異なり一貫性があるので、他のfalseになるような値よりも`nothing`を使うことを推奨します。

```
const button = html`${
 user.isAdmin
   ? html`<button>DELETE</button>`
   : nothing
}`;
```
## render(value: unknown, container: [HTMLElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement) | [DocumentFragment](https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment), options?: [RenderOptions](https://japanese-document.github.io/lit/api-LitElement.html#type_RenderOptions)): [RootPart](https://lit.dev/docs/api/misc/#RootPart)

### Import

```
import { render } from 'lit';
```

`value`(ほとんどの場合、lit-htmlのTemplateResult)を`container`にレンダリングします。
下記の例では"Hello, Zoe!"をコンテンツとして持つpタグを`document.body`内に追加します。

```
import {html, render} from 'lit';

const name = "Zoe";
render(html`<p>Hello, ${name}!</p>`, document.body);
```

## svg(strings: TemplateStringsArray, values: Array<unknown>): [TemplateResult](https://japanese-document.github.io/lit/api-templates.html#type_TemplateResult)

### Import

```
import { svg } from 'lit';
```

テンプレートリテラルを効率的にレンダリングしてコンテナを更新するSVGフラグメント(SVG用のTemplateResult)に変換します。
svgタグ関数はSVGフラグメントもしくは`<svg>`タグ内の要素のみを取り扱います。
よくある間違いとしてsvgタグ関数が付与されたテンプレートに`<svg>`要素を配置することがあります。
`<svg>`要素はHTML要素です。だから、`<svg>`要素は`html`タグ関数が付与されたテンプレート内で使われる必要があります。

SVGフラグメントは要素のshadow root内にあります。だから、`<svg>`HTML要素内でSVGフラグメントを使うことはできません。
だから、LitElementの`render()`メソッドはSVGフラグメントを返しても正常に動作しません。

```
const rect = svg`<rect width="10" height="10"></rect>`;
const myImage = html`
  <svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">
    ${rect}
  </svg>`;
```

## type SanitizerFactory

### Import

```
import { SanitizerFactory } from 'lit';
```

### Type

(node: Node, name: string, type: "property" | "attribute") => [ValueSanitizer](https://lit.dev/docs/api/misc/#ValueSanitizer)

### 詳細

値をDOMに書き込む前に、値をサニタイズします。
XSSを防ぐために許可する値と許可しない値を判別する用途で、これを実装します。
このコールバックの使い方の一例として、リスクの高いフィールドのリストに対応する属性とプロパティをチェックして、
それらのフィールドの値の安全性を点検することがあります。
Closureの[Safe HTML Types](https://github.com/google/safe-html-types/blob/master/doc/safehtml-types.md)はこのテクニックを使った実装の一例です。
[TrustedTypes polyfill](https://github.com/WICG/trusted-types)のAPI専用モードもこのテクニックに使うことができます。

## type SVGTemplateResult

### Import

```
import { TemplateResult } from 'lit';
```

### Type

TemplateResult&lt;SVG_RESULT&gt;

## type TemplateResult

### Import

```
import { TemplateResult } from 'lit';
```

### Type

{_$litType$: T, strings: TemplateStringsArray, values: Array&lt;unknown&gt;}

### 詳細

`TemplateResult`はテンプレートをレンダリングすることに必要なすべての情報を持っています。それはテンプレートの文字列、エクスプレッションの値、テンプレートのタイプ(svg、html)です。
`TemplateResult`オブジェクト自身はDOMを生成しません。
DOMを生成もしくは更新するには、`TemplateResult`をレンダリングします。
詳しくは[レンダリング](https://japanese-document.github.io/lit/components-rendering.html)を見てください。

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