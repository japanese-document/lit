{ "header": {"name": "コンポーネント", "order": 0}, "order": 7 }
---
# デコレータ

デコレータはクラス、クラスメソッド、そしてクラスフィールドの動作を変更することができる特別な関数です。
Litはデコレータを使ってcustom elementsの登録、リアクティブプロパティ、クエリ等の宣言的なAPIを提供します。

Litをコンポーネントの定義を定型文を省いて簡潔にするためのデコレータのセットを用意しています。
例えば、デコレータの`@customElement`と`@property`は基本的なコンポーネントの定義をコンパクトにします。

```ts
@customElement('my-element')
export class MyElement extends LitElement {
  @property() greeting = "Welcome";
  @property() name = "Sally";
  @property({type: Boolean}) emphatic = true;
  //...
}
```

`@customElement`デコレータはcustom elementsを定義します。これは下記と等価です。

```js
customElements.define('my-element', MyElement);
```

`@property`デコレータはリアクティブプロパティをセットします。詳しくは[リアクティブプロパティ](https://japanese-document.github.io/lit/components-properties.html)を見てください。

## ビルトインデコレータ

| デコレータ | サマリー | 詳細 |
|-----------|---------|--------------|
| [@customElement](https://lit.dev/docs/api/decorators/#customElement) | custom elementsを定義する | [定義](https://japanese-document.github.io/lit/components-defining.html) |
| [@eventOptions](https://lit.dev/docs/api/decorators/#eventOptions) | イベントリスナのoptionsを加える | [イベント](https://japanese-document.github.io/lit/components-events.html#イベントリスナのオプションを設定する) |
| [@property](https://lit.dev/docs/api/decorators/#property) | パブリックプロパティを定義する | [リアクティブプロパティ](https://japanese-document.github.io/lit/components-properties.html#デコレータでプロパティを設定する) |
| [@state](https://lit.dev/docs/api/decorators/#state) | プライベートステートプロパティを定義する | [リアクティブプロパティ](https://japanese-document.github.io/lit/components-properties.html#インターナルリアクティブステート) |
| [@query](https://lit.dev/docs/api/decorators/#query) | コンポーネントのテンプレート内にある要素を返すプロパティを定義する | [Shadow DOM](https://japanese-document.github.io/lit/components-shadow-dom.html#_query) |
| [@queryAll](https://lit.dev/docs/api/decorators/#queryAll) | コンポーネントのテンプレート内にある要素のリストを返すプロパティを定義する | [Shadow DOM](https://japanese-document.github.io/lit/components-shadow-dom.html#_queryAll) |
| [@queryAsync](https://lit.dev/docs/api/decorators/#queryAsync) | コンポーネントのテンプレート内にある要素をresolveするPromiseを返すプロパティを定義する | [Shadow DOM](https://japanese-document.github.io/lit/components-shadow-dom.html#_queryAsync) |
| [@queryAssignedElements](https://lit.dev/docs/api/decorators/#queryAssignedElements) | 指定したslotに置き換えられた要素を返すプロパティを定義する | [Shadow DOM](https://japanese-document.github.io/lit/components-shadow-dom.html#_queryAssignedElementsデコレータと_queryAssignedNodesデコレータ) |
| [@queryAssignedNodes](https://lit.dev/docs/api/decorators/#queryAssignedNodes) | 指定したslotに置き換えられたNodeを返すプロパティを定義する | [Shadow DOM](https://japanese-document.github.io/lit/components-shadow-dom.html#_queryAssignedElementsデコレータと_queryAssignedNodesデコレータ) |

## デコレータをimportする

You can import all the lit decorators via the `lit/decorators.js` module:

```ts
import {customElement, property, eventOptions, query} from 'lit/decorators.js';
```

To reduce the amount of code needed to run the component, decorators can be imported individually into component code. All decorators are available at `lit/decorators/<decorator-name>.js`. For example,

```ts
import {customElement} from 'lit/decorators/custom-element.js';
import {eventOptions} from 'lit/decorators/event-options.js';
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