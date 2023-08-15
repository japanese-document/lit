{ "header": {"name": "テンプレート", "order": 1}, "order": 1 }
---
# リスト

Litでは標準のJavaScriptを使って繰り返し処理をするテンプレートを作成することができます。
また、Litは特定の条件を満たすリストからテンプレートをより効率的に生成するための`repeat`ディレクティブを用意しています。

## 配列をレンダリングする

child expressionの位置に配列やiterableを置くと、Litは下記のように配列内のすべての要素をレンダリングします。

```ts
@property() colors = ['red', 'green', 'blue'];

render() {
  return html`<p>Colors: ${this.colors}</p>`;
}
// Colors: redgreenblue
```

ほとんどの場合、上記のようにそのまま使うことはないでしょう。

## mapを使って繰り返しテンプレートを作成する

リストをレンダリングする際に、下記のように`map`を使って、データのリストをテンプレートのリストに変更することができます。

```ts
@property() colors = ['red', 'green', 'blue'];

render() {
  return html`
    <ul>
      ${this.colors.map((color) =>
        html`<li style="color: ${color}">${color}</li>`
      )}
    </ul>
  `;
}
// ・ red
// ・ green
// ・ blue
```

上記のエクスプレッションが`TemplateResult`オブジェクトの配列を返していることに注目してください。
Litはサブテンプレートやそれ以外の値を値に持つ配列やiterableをレンダリングします。

## ループを使って繰り返しテンプレートを作成する

下記のようにテンプレートの配列を作成して、それをエクスプレッション内に配置することができます。

```ts
render() {
  const itemTemplates = [];
  for (const i of this.items) {
    itemTemplates.push(html`<li>${i}</li>`);
  }

  return html`
    <ul>
      ${itemTemplates}
    </ul>
  `;
}
```

## repeatディレクティブ

ほとんどの場合、ループや`map`を使って繰り返しテンプレートを作成することは効率的です。
しかし、大きなリストの順番を入れ替える、要素を追加する、要素を削除する場合では、
このアプローチは多数のDOM Nodeの更新を引き起こす可能性があります。

そんな時は`repeat`ディレクティブが役立ちます。

The `repeat` directive performs efficient updates of lists based on user-supplied keys:

```ts
repeat(items, keyFunction, itemTemplate)
```

Where:

*   `items` is an array or iterable.
*   `keyFunction` is a function that takes a single item as an argument and returns a guaranteed unique key for that item.
*   `itemTemplate` is a template function that takes the item and its current index as arguments, and returns a `TemplateResult`.

For example:

{% playground-example "v2-docs/templates/lists-repeat/" "my-element.ts" %}

If you re-sort the `employees` array, the `repeat` directive reorders the existing DOM nodes.

To compare this to Lit's default handling for lists, consider reversing a large list of names:

*   For a list created using `map`, Lit maintains the DOM nodes for the list items, but reassigns the values.
*   For a list created using `repeat`, the `repeat` directive reorders the _existing_ DOM nodes, so the nodes representing the first list item move to the last position.


### When to use map or repeat

Which repeat is more efficient depends on your use case:

*   If updating the DOM nodes is more expensive than moving them, use the `repeat` directive.

*   If the DOM nodes have state that _isn't_ controlled by a template expression, use the `repeat` directive.

    For example, consider this list:

    ```js
    html`${this.users.map((user) =>
      html`
        <div><input type="checkbox"> ${user.name}</div>
      `)
    }`
    ```

    The checkbox has a checked or unchecked state, but it isn't controlled by a template expression.

    If  you reorder the list after the user has checked one or more checkboxes, Lit would update the names associated with the checkboxes, but not the state of the checkboxes.

 If neither of these situations apply, use `map` or looping statements.

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