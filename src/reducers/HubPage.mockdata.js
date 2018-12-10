import * as utils       from './utils'
import * as constants   from '../constants/Constants'

export const testBoard = {

    content_getBoardList: [
        {
          ID:               '948UChtsWe1EdMpYdfikv7eGbFJE9nmXvdiTXJ3VvEfoiSAQqqNtd8Q',
          Title:            'SGVsbG8gTXkgQm9hcmQ=', // Hello My Board
          S:                constants.STATUS_ARRAY.indexOf('StatusAlive'),
          CreateTS:         utils.emptyTimeStamp(),
          UpdateTS:         utils.emptyTimeStamp(),
          JT:               utils.emptyTimeStamp(),
          ArticleCreateTS:  utils.emptyTimeStamp(),
          LastSeen:         utils.emptyTimeStamp(),
          C:               '8PekZyubu7TRhBZkB4BcWoYHBH1GAb5Cy1qXesUXwTdnphhuzfhXbRS',
          BT:               constants.ENTITY_TYPE_ARRAY.indexOf('EntityTypePersonal'),
        }
    ],

    me_getBoardRequests: [
    ],

    account_getUserNameByIDs: [
        {
            ID:   '8PekZyubu7TRhBZkB4BcWoYHBH1GAb5Cy1qXesUXwTdnphhuzfhXbRS',
            N:    'c2FtbXVp', //sammui
        }
    ],

    account_getUserImgByIDs: [
        {
            ID:     '8PekZyubu7TRhBZkB4BcWoYHBH1GAb5Cy1qXesUXwTdnphhuzfhXbRS',
            T:      constants.IMG_TYPE_ARRAY.indexOf('ImgTypeJPEG'),
            I:      '', // no image
            W:      100,
            H:      100,
        }
    ],
}
