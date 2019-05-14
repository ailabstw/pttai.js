import React, { PureComponent } from 'react'
import { connect }              from 'react-redux'
import { bindActionCreators }   from 'redux'
import Modal                    from 'react-modal'
import Immutable                from 'immutable'

import * as doShowOpLogModal    from '../reducers/ShowOpLogModal'

import * as constants           from '../constants/Constants'
import * as modalConstants      from '../constants/ModalConstants'
import DropdownComponent        from '../components/DropdownComponent'
import { epoch2FullTimeFormat,
         epoch2FullTimeMsFormat } from '../utils/utilDatetime'

import styles from './ShowOpLogModal.css'

class ShowOpLogModal extends PureComponent {
  constructor(props) {
    super();
    this.state = {
      tab: props.modalInput.tabs[0],
      opLog: {},
      expandIdx: -1,
    };
    this.refreshPageInterval = null
    this.expandRow = this.expandRow.bind(this)
  }

  componentWillMount() {
    const { actions: { doShowOpLogModal }, modalInput: { tabs, params }, myId } = this.props
    doShowOpLogModal.getOpLogs(myId, tabs, params)

    this.refreshPageInterval = setInterval(() => doShowOpLogModal.getOpLogs(myId, tabs, params), constants.REFRESH_INTERVAL);
  }

  componentWillUnmount() {
    clearInterval(this.refreshPageInterval)
  }

  expandRow(idx) {
    const { expandIdx } = this.state

    if (idx === expandIdx) {
      this.setState({ expandIdx: -1 })
    } else {
      this.setState({ expandIdx: idx })
    }
  }

  render() {
    const { myId,
            showOpLogModal,
            onModalClose,
            modal: { currentModal },
            modalInput: { tabs }} = this.props

    const { tab, expandIdx } = this.state

    let me      = showOpLogModal.get(myId, Immutable.Map())
    let opLogs  = me.get('opLogs', Immutable.Map()).toJS()
    let opLog   = opLogs[tab]? opLogs[tab]: []
    let that    = this

    let dropdownList = tabs.map((item, index) => {
      let title   = null
      let fTitle  = null
      switch(item) {
          case constants.SHOW_PTT_MASTER_TAB:
            title   = 'ptt master'
            fTitle  = 'Ptt Master Op-Log'
            break;
          case constants.SHOW_PTT_ME_TAB:
            title   = 'ptt me'
            fTitle  = 'Ptt Me Op-Log'
            break;
          case constants.SHOW_CONTENT_BOARD_TAB:
            title   = 'board'
            fTitle  = 'Content Board Op-Log'
            break;
          case constants.SHOW_CONTENT_OPKEY_TAB:
            title   = 'opkey'
            fTitle  = 'Content Opkey Op-Log'
            break;
          case constants.SHOW_CONTENT_MASTER_TAB:
            title   = 'master'
            fTitle  = 'Content Master Op-Log'
            break;
          case constants.SHOW_CONTENT_MEMBER_TAB:
            title   = 'member'
            fTitle  = 'Content Member Op-Log'
            break;
          case constants.SHOW_FRIEND_FRIEND_TAB:
            title   = 'friend'
            fTitle  = 'Friend Friend Op-Log'
            break;
          case constants.SHOW_FRIEND_MASTER_TAB:
            title   = 'master'
            fTitle  = 'Friend Master Op-Log'
            break;
          case constants.SHOW_FRIEND_MEMBER_TAB:
            title   = 'member'
            fTitle  = 'Friend Member Op-Log'
            break;
          case constants.SHOW_FRIEND_OPKEY_TAB:
            title   = 'opkey'
            fTitle  = 'Friend Opkey Op-Log'
            break;
          case constants.SHOW_PTT_PEERS_TAB:
            title   = 'ptt peers'
            fTitle  = 'Ptt Peers'
            break;
          case constants.SHOW_CONTENT_PEERS_TAB:
            title   = 'peers'
            fTitle  = 'Content Board Peers'
            break;
          case constants.SHOW_FRIEND_PEERS_TAB:
            title   = 'peers'
            fTitle  = 'Friend peers'
            break;
          case constants.SHOW_LAST_ANNOUNCE_P2P_TAB:
            title   = 'last p2p'
            fTitle  = 'Ptt Last Annouce p2p'
            break;
          default:
            break;
      }
      return {
          id: item,
          title: title,
          fullTitle: fTitle,
          selected: false,
          action: () => that.setState({tab:item}),
      }
    })

    return (
      <div>
        <Modal
          overlayClassName="ShowOpLogModal__Overlay"
          style={modalConstants.showOpLogModalStyels}
          isOpen={currentModal !== null}
          onRequestClose={null}
          contentLabel="Show Op Log Modal">
          <div className={styles['root']}>
            <div className={styles['top-bar']}>
              <div className={styles['prev-button']}>
                <div className={styles['prev-button-icon']} onClick={onModalClose}></div>
              </div>
              <div className={styles['title']}>
                OP Logs
              </div>
              <div className={styles['multi-device']}>
                <span >
                  <DropdownComponent title={ dropdownList.find( i => i.id === tab ).title }
                                     list={ dropdownList }/>
                </span>
              </div>
            </div>
            <div className={styles['content']}>
              <div className={styles['content-title']}>{dropdownList.find( i => i.id === tab ).fullTitle}</div>
              <div className={styles['oplog-list']}>
              {
                tab === constants.SHOW_LAST_ANNOUNCE_P2P_TAB ?
                  (
                    <div className={styles['oplog-item']}>
                      <div className={styles['item']}>
                        <div className={styles['op-title']}>Connect Time</div>
                        <div className={styles['op-value']}>{epoch2FullTimeFormat(opLog.T)}</div>
                      </div>
                    </div>
                  ) : tab.indexOf('_PEERS_TAB') !== -1 ? opLog.map((item, index) => {
                  return (
                    <div className={styles['oplog-item']} key={index}>
                      <div className={styles['item-index']}>
                        <div title={'User ID: ' + item.UID} className={styles['op-value-index']}>{item.userName}</div>
                      </div>
                      <div hidden className={styles['item']}>
                        <div className={styles['op-title']}>User Name</div>
                        <div className={styles['op-value']}>{item.userName}</div>
                      </div>
                      <div className={styles['item']}>
                        <div className={styles['op-title']}>Peer Type</div>
                        <div title={item.T} className={styles['op-value']}>{constants.PEER_TYPE_ARRAY[item.T]}</div>
                      </div>
                      <div className={styles['item']}>
                        <div className={styles['op-title']}>Node ID</div>
                        <div title={item.ID} className={styles['op-value']}>{item.ID}</div>
                      </div>
                      <div hidden className={styles['item']}>
                        <div className={styles['op-title']}>User ID</div>
                        <div className={styles['op-value']}>{item.UID}</div>
                      </div>
                      <div hidden className={styles['item']}>
                        <div className={styles['op-title']}>IP</div>
                        <div className={styles['op-value']}>{item.Addr ? item.Addr.IP : 'null'}</div>
                      </div>
                      <div hidden className={styles['item']}>
                        <div className={styles['op-title']}>Port</div>
                        <div className={styles['op-value']}>{item.Addr ? item.Addr.Port : 'null'}</div>
                      </div>
                      <div hidden className={styles['item']}>
                        <div className={styles['op-title']}>Zone</div>
                        <div className={styles['op-value']}>{item.Addr ? item.Addr.Zone : 'null'}</div>
                      </div>
                    </div>
                  )
                }) : opLog.map((item, index) => {

                  let itemMeta = {
                    'Version': item.V,
                    'Oplog ID': item.ID,
                    'Is Sync': item.y,
                  }

                  let OplogConst = {
                    'SHOW_PTT_ME_TAB': constants.PTT_ME_OP_TYPE_ARRAY,

                    'SHOW_CONTENT_BOARD_TAB':  constants.BOARD_OP_TYPE_ARRAY,
                    'SHOW_CONTENT_MASTER_TAB': constants.BOARD_OP_TYPE_ARRAY,
                    'SHOW_CONTENT_MEMBER_TAB': constants.BOARD_OP_TYPE_ARRAY,
                    'SHOW_CONTENT_OPKEY_TAB':  constants.BOARD_OP_TYPE_ARRAY,

                    'SHOW_FRIEND_FRIEND_TAB': constants.FRIEND_OP_TYPE_ARRAY,
                    'SHOW_FRIEND_MASTER_TAB': constants.FRIEND_OP_TYPE_ARRAY,
                    'SHOW_FRIEND_MEMBER_TAB': constants.FRIEND_OP_TYPE_ARRAY,
                    'SHOW_FRIEND_OPKEY_TAB':  constants.FRIEND_OP_TYPE_ARRAY
                  }

                  return (
                    <div className={styles['oplog-item']} key={index}>
                      <div className={styles['item-index']} onClick={() => this.expandRow(index)}>
                        <div title={JSON.stringify(itemMeta, null, 4)} className={styles['op-value-index']}>{OplogConst[tab][item.O] + ' @ ' + epoch2FullTimeMsFormat(item.UT)}</div>
                      </div>
                      <div className={styles['item']}>
                        <div className={styles['op-title']}>Creator</div>
                        <div title={'Creator ID: ' + item.CID} className={styles['op-value']}>{item.creatorName + ' @ ' + epoch2FullTimeMsFormat(item.CT)}</div>
                      </div>
                      {
                        expandIdx === index ? (
                          <span>
                          <div className={styles['item']}>
                            <div className={styles['op-title']}>Oplog ID</div>
                            <div title={item.ID} className={styles['op-value']}>{item.ID}</div>
                          </div>
                          <div hidden className={styles['item']}>
                            <div className={styles['op-title']}>Creator ID</div>
                            <div title={item.CID} className={styles['op-value']}>{item.CID}</div>
                          </div>
                          <div hidden className={styles['item']}>
                            <div className={styles['op-title']}>Create TS</div>
                            <div title={epoch2FullTimeMsFormat(item.CT)} className={styles['op-value']}>{epoch2FullTimeMsFormat(item.CT)}</div>
                          </div>
                          <div className={styles['item']}>
                            <div className={styles['op-title']}>Obj ID</div>
                            <div title={item.OID} className={styles['op-value']}>{item.OID}</div>
                          </div>
                          <div hidden className={styles['item']}>
                            <div className={styles['op-title']}>Op</div>
                            <div title={item.O} className={styles['op-value']}>{OplogConst[tab][item.O]}</div>
                          </div>
                          <div className={styles['item']}>
                            <div className={styles['op-title']}>Data</div>
                            <div title={JSON.stringify(item.D, null, 4)} className={styles['op-value']}>{JSON.stringify(item.D)}</div>
                          </div>
                          <div hidden className={styles['item']}>
                            <div className={styles['op-title']}>Update TS</div>
                            <div title={epoch2FullTimeMsFormat(item.UT)} className={styles['op-value']}>{epoch2FullTimeMsFormat(item.UT)}</div>
                          </div>
                          <div className={styles['item']}>
                            <div className={styles['op-title']}>Master Log ID</div>
                            <div title={item.mID} className={styles['op-value']}>{item.mID}</div>
                          </div>
                          <div className={styles['item']}>
                            <div className={styles['op-title']}>Master Signs</div>
                            <div title={JSON.stringify(item.m, null, 4)} className={styles['op-value']}>{JSON.stringify(item.m)}</div>
                          </div>
                          <div className={styles['item']}>
                            <div className={styles['op-title']}>Internal Signs</div>
                            <div title={JSON.stringify(item.i, null, 4)} className={styles['op-value']}>{JSON.stringify(item.i)}</div>
                          </div>
                          <div className={styles['item']}>
                            <div className={styles['op-title']}>Is Sync</div>
                            <div title={item.y} className={styles['op-value']}>{item.y}</div>
                          </div>
                          <div className={styles['item']}>
                            <div className={styles['op-title']}>Version</div>
                            <div title={item.V} className={styles['op-value']}>{item.V}</div>
                          </div>
                          </span>
                        ):null
                      }
                    </div>
                  )
                })
              }
              </div>
            </div>
          </div>
        </Modal>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => ({
  ...state,
})

const mapDispatchToProps = (dispatch) => ({
  actions: {
    doShowOpLogModal: bindActionCreators(doShowOpLogModal, dispatch),
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(ShowOpLogModal)
