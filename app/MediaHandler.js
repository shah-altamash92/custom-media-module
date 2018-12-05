
import RNFS from "react-native-fs";


const getExistingFiles = () => {
    console.log(RNFS.CachesDirectoryPath);
    console.log(RNFS.DocumentDirectoryPath);
    console.log(RNFS.TemporaryDirectoryPath);

    RNFS.readDir(RNFS.TemporaryDirectoryPath + '/Camera/')
        .then((result) => {
            console.log('GOT RESULT');
            result.forEach((item) => {
                console.log(item.path + ' / ' + item.name + ' / is media:' + this.isMedia(item.name));
            })
            console.log('GOT RESULT', result.length);
            // return Promise.all([RNFS.stat(result[0].path), result[0].path]);
        })
        .catch((err) => {
            console.log(err.message, err.code);
        });

    RNFS.readDir(RNFS.DocumentDirectoryPath)
        .then((result) => {
            result.forEach((item) => {
                console.log(item.path + ' / ' + item.name + ' / is media:' + this.isMedia(item.name));
            })
            console.log('GOT RESULT', result.length);
            // return Promise.all([RNFS.stat(result[0].path), result[0].path]);
        })
        .catch((err) => {
            console.log(err.message, err.code);
        });

    RNFS.readDir(RNFS.TemporaryDirectoryPath + '/react-native-image-crop-picker/')
        .then((result) => {
            result.forEach((item) => {
                console.log(item.path + ' / ' + item.name + ' / is media:' + this.isMedia(item.name));
            })
            console.log('GOT RESULT', result.length);
            // return Promise.all([RNFS.stat(result[0].path), result[0].path]);
        })
        .catch((err) => {
            console.log(err.message, err.code);
        });
}

const deleteExistingMedia = () => {

    RNFS.readDir(RNFS.TemporaryDirectoryPath + '/Camera/')
        .then((result) => {
            // console.log('GOT RESULT');
            result.forEach((item) => {
                // console.log(item.name+' / is media:'+this.isMedia(item.name));
                if (this.isMedia(item.name))
                    this.deleteFile(item.path);
            });
        })
        .catch((err) => {
            console.log(err.message, err.code);
        });

    RNFS.readDir(RNFS.TemporaryDirectoryPath + '/react-native-image-crop-picker/')
        .then((result) => {
            // console.log('GOT RESULT');
            result.forEach((item) => {
                // console.log(item.name+' / is media:'+this.isMedia(item.name));
                if (this.isMedia(item.name))
                    this.deleteFile(item.path);
            });
        })
        .catch((err) => {
            console.log(err.message, err.code);
        });

    RNFS.readDir(RNFS.DocumentDirectoryPath)
        .then((result) => {
            result.forEach((item) => {
                // console.log(item.name+' / is media:'+this.isMedia(item.name));
                if (this.isMedia(item.name))
                    this.deleteFile(item.path);
            });
        })
        .catch((err) => {
            console.log(err.message, err.code);
        });
}

deleteFile = (filePath) => {
    RNFS.exists(filePath)
        .then((res) => {
            if (res) {
                RNFS.unlink(filePath)
                    .then(() => {
                        console.log('FILE DELETED');
                    });
            }
        })
}

isMedia = (name) => {
    switch (name.substring(name.lastIndexOf('.') + 1)) {
        case 'jpg':
        case 'jpeg':
        case 'mp4':
        case 'mp3':
        case 'wav':
            return true;
        default:
            return false;
    }
}

export default { getExistingFiles, deleteExistingMedia };
