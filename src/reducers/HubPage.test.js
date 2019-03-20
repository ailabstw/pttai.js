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

let rootUUID    = getUUID()
let pageUUID    = getUUID()

describe('Using getBoardList()', () => {

    const setup = async mockData => {
        let mockQuery   = {}
        let paramQuery  = {}

        const store = setupStore(mockData);

        // init root page
        await store.dispatch(utils.init({rootUUID, myClass, myDuck, ...mockQuery, ...paramQuery}))
        await store.dispatch(utils.setRoot(rootUUID, myClass, appDuck))

        // init hubpage
        await store.dispatch(init(pageUUID, rootUUID, myClass, myDuck))
        return store
    }

    it('should find no board when fetching nothing', async () => {
        const store = await setup(HubpageMockData.testNoBoard)

        await store.dispatch(getBoardList(pageUUID, true, constants.NUM_BOARD_PER_REQ))

        await delay(20); /* wait long enough for state to be updated */

        let hubPage     = store.getState()['hubPage'].get(pageUUID, Immutable.Map())
        let boardList   = hubPage.get('boardList', Immutable.List()).toJS()
        let noBoard     = hubPage.get('noBoard')

        expect(boardList).toHaveLength(0);
        expect(noBoard).toBe(true);
    })

    // BoardType could be personal, private, and public
    // getBoardList will only select boards whose type is private

    it('should find one board when fetching one private board', async () => {
        const store = await setup(HubpageMockData.testPrivateBoard)

        await store.dispatch(getBoardList(pageUUID, true, constants.NUM_BOARD_PER_REQ))

        await delay(20); /* wait long enough for state to be updated */

        let hubPage     = store.getState()['hubPage'].get(pageUUID, Immutable.Map())
        let boardList   = hubPage.get('boardList', Immutable.List()).toJS()
        let noBoard     = hubPage.get('noBoard')

        expect(boardList).toHaveLength(1);
        expect(noBoard).toBe(false);
    })

    it('should find no board when fetching personal board', async () => {
        const store = await setup(HubpageMockData.testPersonalBoard)

        await store.dispatch(getBoardList(pageUUID, true, constants.NUM_BOARD_PER_REQ))

        await delay(20); /* wait long enough for state to be updated */

        let hubPage     = store.getState()['hubPage'].get(pageUUID, Immutable.Map())
        let boardList   = hubPage.get('boardList', Immutable.List()).toJS()
        let noBoard     = hubPage.get('noBoard')

        expect(boardList).toHaveLength(0);
        expect(noBoard).toBe(true);
    })

    // deleted board should not be counted, even if it is private

    it('should find no board when fetching deleted private board', async () => {
        const store = await setup(HubpageMockData.testDeletedPrivateBoard)

        await store.dispatch(getBoardList(pageUUID, true, constants.NUM_BOARD_PER_REQ))

        await delay(20); /* wait long enough for state to be updated */

        let hubPage     = store.getState()['hubPage'].get(pageUUID, Immutable.Map())
        let boardList   = hubPage.get('boardList', Immutable.List()).toJS()
        let noBoard     = hubPage.get('noBoard')

        expect(boardList).toHaveLength(0);
        expect(noBoard).toBe(true);
    })

    it('should find no board when fetch nothing not for the first time', async () => {
        const store = await setup(HubpageMockData.testNoBoard)

        await store.dispatch(getBoardList(pageUUID, false, constants.NUM_BOARD_PER_REQ))

        await delay(20); /* wait long enough for state to be updated */

        let hubPage     = store.getState()['hubPage'].get(pageUUID, Immutable.Map())
        let boardList   = hubPage.get('boardList', Immutable.List()).toJS()
        let noBoard     = hubPage.get('noBoard')

        expect(boardList).toHaveLength(0);
        expect(noBoard).toBe(true);
    })

})
