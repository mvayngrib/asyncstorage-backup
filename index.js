
var {
  AsyncStorage,
  AlertIOS
} = require('react-native')

var BACKUP_PREFIX = 'RESERVED_KEY_FOR_ASYNCSTORAGE_BACKUP_'

export function loadFromLastBackup() {
  return lastBackupNumber()
    .then((n) => loadFromBackup(n))
}

export function promptLoadFromBackup () {
  return lastBackupNumber()
    .then((n) => {
      var choices = []
      if (n === -1) {
        return AlertIOS.alert(
          'No backups found',
        )
      }

      return new Promise((resolve, reject) => {
        for (var i = 0; i <= n; i++) {
          choices.push({
            text: 'Backup #' + i,
            onPress: null
          })
        }

        choices.forEach((choice, idx) => {
          choice.onPress = function () {
            loadFromBackup(idx)
              .then(resolve)
              .catch(reject)
          }
        })

        choices.push({
          text: 'Cancel',
          onPress: () => reject(new Error('canceled load from backup'))
        })

        AlertIOS.alert(
          'Load from one of the backups below',
          null,
          choices
        )
      })
    })
}

export function loadFromBackup(n) {
  if (n == null) {
    return promptLoadFromBackup()
  }

  var backup
  var backupName = BACKUP_PREFIX + n
  return Promise.all([
      AsyncStorage.getAllKeys(),
      AsyncStorage.getItem(backupName)
    ])
    .then(([keys, _backup]) => {
      if (!_backup) throw new Error('backup not found')

      backup = _backup
      keys.splice(keys.indexOf(backupName), 1)
      return AsyncStorage.multiRemove(keys)
    })
    .then(() => {
      return AsyncStorage.multiSet(JSON.parse(backup))
    })
    .then(() => n)
}

export function lastBackupNumber() {
  return AsyncStorage.getAllKeys()
    .then((keys) => getLastBackupNumber(keys))
}

export function backup() {
  var backupNumber
  return AsyncStorage.getAllKeys()
    .then((keys) => AsyncStorage.multiGet(keys))
    .then((keyValuePairs) => {
      var keys = keyValuePairs.map(([k, v]) => k)
      backupNumber = getLastBackupNumber(keys) + 1
      return AsyncStorage.setItem(BACKUP_PREFIX + backupNumber, JSON.stringify(keyValuePairs))
    })
    .then(() => backupNumber)
}

export function clear () {
  return AsyncStorage.getAllKeys()
    .then((keys) => {
      keys = keys.filter((k) => k.indexOf(BACKUP_PREFIX) !== 0)
      return AsyncStorage.multiRemove(keys)
    })
}

function getLastBackupNumber (keys) {
  return keys.reduce((memo, next) => {
    if (next.indexOf(BACKUP_PREFIX) !== 0) {
      return memo
    } else {
      return Math.max(memo, Number(next.slice(BACKUP_PREFIX.length)))
    }
  }, -1)
}
