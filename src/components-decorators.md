{ "header": {"name": "コンポーネント", "order": 0}, "order": 7 }
---
# デコレータ

Decorators are special functions that can modify the behavior of classes, class methods, and class fields.
Lit uses decorators to provide declarative APIs for things like registering elements, reactive properties, and queries.

Lit supplies a set of decorators that reduce the amount of boilerplate code you need to write when defining a component. For example, the `@customElement` and `@property` decorators make a basic element definition more compact:

```ts
@customElement('my-element')
export class MyElement extends LitElement {
  @property() greeting = "Welcome";
  @property() name = "Sally";
  @property({type: Boolean}) emphatic = true;
  //...
}
```

The `@customElement` decorator defines a custom element, equivalent to calling:

```js
customElements.define('my-element', MyElement);
```

The `@property` decorator declares a reactive property.

See [リアクティブプロパティ](https://japanese-document.github.io/lit/components-properties.html) for more information about configuring properties.

## ビルトインデコレータ

| デコレータ | サマリー | 詳細 |
|-----------|---------|--------------|
| [@customElement](https://lit.dev/docs/api/decorators/#customElement) | custom elementsを定義する | [定義](https://japanese-document.github.io/lit/components-defining.html) |
| [@eventOptions](https://lit.dev/docs/api/decorators/#eventOptions) | イベントリスナのoptionsを加える | [イベント](https://japanese-document.github.io/lit/components-events.html#イベントリスナのオプションを設定する) |
| [@property](https://lit.dev/docs/api/decorators/#property) | パブリックプロパティを定義する | [リアクティブプロパティ](https://japanese-document.github.io/lit/components-properties.html#デコレータでプロパティを設定する) |
| [@state](https://lit.dev/docs/api/decorators/#state) | プライベートステートプロパティを定義する | [リアクティブプロパティ](https://japanese-document.github.io/lit/components-properties.html#インターナルリアクティブステート) |
| [@query](https://lit.dev/docs/api/decorators/#query) | Defines a property that returns an element in the component template. | [Shadow DOM](https://japanese-document.github.io/lit/components-shadow-dom.html#_query) |
| [@queryAll](https://lit.dev/docs/api/decorators/#queryAll) | Defines a property that returns a list of elements in the component template. | [Shadow DOM](https://japanese-document.github.io/lit/components-shadow-dom.html#_queryAll) |
| [@queryAsync](https://lit.dev/docs/api/decorators/#queryAsync) | Defines a property that returns a promise that resolves to an element in the component template. | [Shadow DOM](https://japanese-document.github.io/lit/components-shadow-dom.html#_queryAsync) |
| [@queryAssignedElements](https://lit.dev/docs/api/decorators/#queryAssignedElements) | Defines a property that returns the child elements assigned to a specific slot. | [Shadow DOM](https://japanese-document.github.io/lit/components-shadow-dom.html#_queryAssignedElements) |
| [@queryAssignedNodes](https://lit.dev/docs/api/decorators/#queryAssignedNodes) | Defines a property that returns the child nodes assigned to a specific slot. | [Shadow DOM](https://japanese-document.github.io/lit/components-shadow-dom.html#_queryAssignedNodes) |

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