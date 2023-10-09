{ "header": {"name": "API", "order": 3}, "order": 1 }
---
# テンプレート

## html(strings: TemplateStringsArray, values: Array<unknown>): TemplateResult 

### import

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

### inport

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

## svg(strings: TemplateStringsArray, values: Array<unknown>): TemplateResult 

### import

```
import { svg } from 'lit';
```

テンプレートリテラルを効率的にレンダリングしてコンテナを更新するSVGフラグメントに変換します。
svgタグ関数はSVGフラグメントもしくは`<svg>`タグ内の要素のみを取り扱います。
よくある間違いとしてsvgタグ関数が付与されたテンプレートに`<svg>`要素を配置することがあります。
`<svg>`要素はHTML要素です。だから、`<svg>`要素は`html`タグ関数が付与されたテンプレート内で使われる必要があります。

In LitElement usage, it's invalid to return an SVG fragment from the `render()` method,
as the SVG fragment will be contained within the element's shadow root and thus cannot be used within an `<svg>` HTML element.

```
const rect = svg`<rect width="10" height="10"></rect>`;
const myImage = html`
  <svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">
    ${rect}
  </svg>`;
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