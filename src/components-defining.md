{ "header": {"name": "Components", "order": 0}, "order": 0 }
---
# 定義

Litコンポーネントは`LitElement`を拡張したクラスを生成して、そのクラスをブラウザに登録することで定義します。

```ts
@customElement('simple-greeting')
export class SimpleGreeting extends LitElement { /* ... */ }
```

`@customElement`デコレータは[`customElements.define`](https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/define)を実行する処理の省略した表現です。
これはCustom Element classをブラウザに登録します。そして、要素名(この場合は`simple-greeting`)をそれに関連付けます。

JavaScriptを使っていたりデコレータを使わない場合は直接`defined()`を実行します。

```js
export class SimpleGreeting extends LitElement { /* ... */  }
customElements.define('simple-greeting', SimpleGreeting);
```

## LitコンポーネントはHTML要素です

Litコンポーネントを定義すると[custom elements](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements)が定義されます。
つまり、その定義された要素はbuilt-in要素のように使うことができます。

```html
<simple-greeting name="Markup"></simple-greeting>
```

```js
const greeting = document.createElement('simple-greeting');
```

`LitElement`クラスは`HTMLElement`のサブクラスです。
だから、LitコンポーネントはWeb標準の`HTMLElement`のプロパティとメソッドをすべて継承します。
正確には、`LitElement`は`ReactiveElement`を継承しています。
`ReactiveElement`は`HTMLElement`を継承してリアクティブプロパティを実装しています。

![lit-element-inheritance.png](https://japanese-document.github.io/lit/images/lit-element-inheritance.png)

## TypeScriptの型を提供する

TypeScriptはタグ名に基づいて特定のDOM APIが返すクラスを推論します。
例えば、`document.createElement('img')`は`src: string`プロパティを持つ`HTMLImageElement`を返します。
Custom elementsは下記のように`HTMLElementTagNameMap`に加えることによってbuilt-in要素と同じように取り扱われます。

```ts
@customElement('my-element')
export class MyElement extends LitElement {
  @property({type: Number})
  aNumber: number = 5;
  /* ... */
}

declare global {
  interface HTMLElementTagNameMap {
    "my-element": MyElement;
  }
}
```

これによって、以下のコードは適切に型チェックされます。

```ts
const myElement = document.createElement('my-element');
myElement.aNumber = 10;
```

TypeScriptで定義したすべての要素を`HTMLElementTagNameMap`に追加することや
npmにパッケージ公開する際は必ず`.d.ts`でそれらを提供することを推奨します。

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