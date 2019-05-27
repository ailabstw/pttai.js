import { configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

configure({ adapter: new Adapter() })

window.matchMedia = window.matchMedia || function () {
  return {
    matches: false,
    addListener: function () {},
    removeListener: function () {}
  }
}

var localStorageMock = (() => {
  let store = {};

  return {
    hasOwnProperty: (key) => !!store[key],
    getItem: (key) => store[key] || null,
    getAllItems: () => store,
    setItem: (key, value) => { store[key] = value.toString() },
    removeItem: (key) => { delete store[key] },
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(window, 'localStorage', {
     value: localStorageMock
});
