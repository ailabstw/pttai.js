import Immutable            from 'immutable';

import * as utils               from './utils'
import { myDuck as appDuck }    from './App'
import { myClass, myDuck }      from './RootPage'
import { setupStore }           from './testUtils'
import { init,
         getBoardList,
         preprocessSetStartLoading }   from './HubPage'
import * as HubpageMockData            from './Hubpage.mockdata'

import { getUUID }      from '../utils/utils'
import * as constants   from '../constants/Constants'

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

let store       = null
let rootUUID    = getUUID()
let pageUUID    = getUUID()

describe('test Board', () => {

    beforeAll(async () => {

        let mockQuery   = {}
        let paramQuery  = {}

        store = setupStore(HubpageMockData.testBoard);

        // init root page
        await store.dispatch(utils.init({rootUUID, myClass, myDuck, ...mockQuery, ...paramQuery}))
        await store.dispatch(utils.setRoot(rootUUID, myClass, appDuck))

        // init hubpage
        await store.dispatch(init(pageUUID, rootUUID, myClass, myDuck))
    });

    afterAll(() => {
        store = null
    })

    test('test getBoardList()', async () => {

        await store.dispatch(getBoardList(pageUUID, constants.NUM_BOARD_PER_REQ))

        await delay(20); /* wait long enough for state to be updated */

        let hubPage     = store.getState()['hubPage'].get(pageUUID, Immutable.Map())
        let boardList   = hubPage.get('boardList', Immutable.List()).toJS()

        expect(boardList).toHaveLength(1);

    })

    test('test getBoardList() 2', async () => {

        await store.dispatch(getBoardList(pageUUID, constants.NUM_BOARD_PER_REQ))

        await delay(20); /* wait long enough for state to be updated */

        let hubPage     = store.getState()['hubPage'].get(pageUUID, Immutable.Map())
        let boardList   = hubPage.get('boardList', Immutable.List()).toJS()

        expect(boardList).toHaveLength(1);

    })

})


