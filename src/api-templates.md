{ "header": {"name": "API", "order": 2}, "order": 1 }
---
# Templates

## function html

### import

```
import { html } from 'lit';
```

### html(strings: TemplateStringsArray, values: Array<unknown>): TemplateResult<T> 

htmlタグはレンダリングされるDOMを抽象化した値(TemplateResult)を返します。
LitコンポーネントはLitテンプレートがレンダリングされるまで何も処理を行いません。
レンダリングする時、現行のレンダリングで使用したテンプレートが前回のレンダリング時に使用したものと同じ場合は要素を全部置き換えるのではなく差分のみ置き換えます。

```
const header = (title: string) => html`<h1>${title}</h1>`;
```

## value nothing

### inport

```
import { nothing } from 'lit';
```

### nothing: symbol

Prefer using `nothing` over other falsy values as it provides a consistent behavior between various expression binding contexts.
In child expressions, `undefined`, `null`, `''`, and `nothing` all behave the same and render no nodes.
In attribute expressions, `nothing` removes the attribute, while `undefined` and `null` will render an empty string.
In property expressions `nothing` becomes `undefined`.

```
const button = html`${
 user.isAdmin
   ? html`<button>DELETE</button>`
   : nothing
}`;
```
