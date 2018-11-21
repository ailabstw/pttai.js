import { createDuck } from 'redux-duck'

export const myClass = 'MODAL_CONTAINER'

export const myDuck = createDuck(myClass, 'Modal_Container')

const OPEN_MODAL    = myDuck.defineType('OPEN_MODAL')
const CLOSE_MODAL   = myDuck.defineType('CLOSE_MODAL')
const SET_SUBMIT    = myDuck.defineType('SET_SUBMIT')
const SET_INPUT     = myDuck.defineType('SET_INPUT')

const modalState = {
  currentModal: null,
};

export const openModal = (modalType) => ({
  modalType,
  myClass,
  type: OPEN_MODAL,
})

const _openModal = (state, action) => {
  const { modalType } = action
  return {
    ...state,
    currentModal: modalType,
  }
}

export const closeModal = () => ({
  myClass,
  type: CLOSE_MODAL,
})

const _closeModal = (state, action) => {
  return {
    ...state,
    currentModal: null,
  }
}

export const setSubmit = (modalSubmit) => ({
  modalSubmit,
  myClass,
  type: SET_SUBMIT,
})

const _setSubmit = (state, action) => {
  const { modalSubmit } = action

  return {
    ...state,
    modalSubmit: modalSubmit,
  }
}

export const setInput = (data) => ({
  data,
  myClass,
  type: SET_INPUT,
})

const _setInput = (state, action) => {
  const { data } = action

  return {
    ...state,
    modalInput: data,
  }
}

// reducers
const reducer = myDuck.createReducer({
  [OPEN_MODAL]:   _openModal,
  [CLOSE_MODAL]:  _closeModal,
  [SET_SUBMIT]:   _setSubmit,
  [SET_INPUT]:    _setInput,
}, modalState)

export default reducer
