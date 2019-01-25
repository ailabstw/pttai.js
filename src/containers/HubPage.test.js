import React                from 'react'
import ReactDom             from 'react-dom'
import { Provider }         from 'react-redux'
import { mount, unmount }   from 'enzyme'

import HubPage              from './HubPage'
import HubComponent         from '../components/HubComponent'
import BoardListComponent   from '../components/BoardListComponent'

import { getUUID }          from '../utils/utils'
import setupStore           from './testUtils'


let store = null

const hubPageId = getUUID()

describe('HubPage container', () => {

    // let wrapper = null

    // beforeAll(() => {
    //     store = setupStore();
    // });

    // afterAll(() => {
    //     store = null
    // });

    // beforeEach(() => {
    //     wrapper = mount(
    //       <Provider store={store}>
    //         <HubPage myId={hubPageId}/>
    //       </Provider>
    //     );
    // })

    // afterEach(() => {
    //     wrapper.unmount()
    // })

  it('should render the hubpage container', async () => {

    // expect(wrapper.find(HubPage).length).toBe(1);
    // expect(wrapper.find(HubComponent).length).toBe(1);
    // expect(wrapper.find(BoardListComponent).length).toBe(1);

  });
});
