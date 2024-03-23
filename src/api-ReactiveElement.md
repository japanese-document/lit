{ "header": {"name": "API", "order": 4}, "order": 1 }
---
# ReactiveElement

## class ReactiveElement

要素のプロパティや属性を取り扱う要素のベースクラスです。
プロパティが変更されると、updateメソッドが非同期で実行されます。
更新のレンダリング処理を変更したい場合はupdateメソッドをサブクラスで実装します。

### Import

```
import { ReactiveElement } from 'lit';
```

### Attributes

#### attributeChangedCallback(name: string, _old: null | string, value: null | string): void

要素の属性の値が変化した時、プロパティの値をそれと同期させます。
具体的に言うと要素の属性がセットされるとそれに対応するプロパティがセットされます。
このメソッドを実装することはほとんどありません。
このメソッドをオーバーライドする際は、オーバーライドしたメソッド内で`super.attributeChangedCallback(name, _old, value)`を実行する必要があります。

`attributeChangedCallback`に関する詳しい情報は[responding to attribute changes](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#responding_to_attribute_changes)を見てください。

#### static observedAttributes: Array<string>

登録されているプロパティに対応する属性のリストを返します。

### Controllers

#### addController(controller: [ReactiveController](https://lit.dev/docs/api/controllers/#ReactiveController)): void

[リアクティブコントローラ](https://japanese-document.github.io/lit/composition-controllers.html)を要素のリアクティブアップデートサイクルに組み込みます。
要素はライフサイクルコールバックに対応したコントローラのフックメソッドを自動的に実行します。
`addController()`が実行されたとき要素がdocumentに接続している場合、
即座にcontrollerの`hostConnected()`が実行されます。

#### removeController(controller: [ReactiveController](https://lit.dev/docs/api/controllers/#ReactiveController)): void

要素から指定したリアクティブコントローラを削除します。

### Dev mode

#### static disableWarning?: (warningKind: [WarningKind](https://lit.dev/docs/api/misc/#WarningKind)) => void

Disable the given warning category for this class.
This method only exists in development builds, so it should be accessed with a guard like.

```
// Disable for all ReactiveElement subclasses
ReactiveElement.disableWarning?.('migration');
// Disable for only MyElement and subclasses
MyElement.disableWarning?.('migration');
```

#### static enabledWarnings?: Array<[WarningKind](https://lit.dev/docs/api/misc#WarningKind)>

Read or set all the enabled warning categories for this class.
This property is only used in development builds.

#### enableWarning?: (warningKind: [WarningKind](https://lit.dev/docs/api/misc#WarningKind)) => void

Enable the given warning category for this class.
This method only exists in development builds, so it should be accessed with a guard like.

```
// Enable for all ReactiveElement subclasses
ReactiveElement.enableWarning?.('migration');
// Enable for only MyElement and subclasses
MyElement.enableWarning?.('migration');
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