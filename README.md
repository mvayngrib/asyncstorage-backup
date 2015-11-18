# asyncstorage-backup

Note: backups are saved in AsyncStorage, meaning that if you run ``AsyncStorage.clear()``, you will lose your backups!

## Usage

```js

var BeSafe = require('asyncstorage-backup')
BeSafe.backup()
  .then((backupNumber) =>
    AlertIOS.alert(
      `Created backup #${backupNumber}`
    )
  )

var backupNumber = 0
BeSafe.loadFromBackup(backupNumber)
  .then((backupNumber) =>
    AlertIOS.alert(
      `Loaded from backup ${backupNumber}!`
    )
  )

// let the user choose the backup to load from
BeSafe.promptLoadFromBackup()
  .then((backupNumber) =>
    AlertIOS.alert(
      `Loaded from backup ${backupNumber}!`
    )
  )

```
