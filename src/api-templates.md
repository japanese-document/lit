{ "header": {"name": "API", "order": 2}, "order": 1 }
---
# Templates

## html(strings: TemplateStringsArray, values: Array<unknown>): TemplateResult<T> 

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
