import { getStatusClass,
         newCanvasSize }    from './utils';
import { STATUS_ARRAY }     from '../constants/Constants'

test('test getStatusClass()', () => {
    const arrayLen = STATUS_ARRAY.length

    expect(getStatusClass(-1)).toBe('invalid');
    expect(getStatusClass(4.5)).toBe('invalid');
    expect(getStatusClass(null)).toBe('invalid');
    expect(getStatusClass('1')).toBe('invalid');
    expect(getStatusClass(undefined)).toBe('invalid');
    expect(getStatusClass(0)).toBe('pre-alive');
    expect(getStatusClass(7)).toBe('alive');
    expect(getStatusClass(8)).toBe('failed');
    expect(getStatusClass(9)).toBe('post-failed');
    expect(getStatusClass(arrayLen - 1)).toBe('post-failed');
    expect(getStatusClass(arrayLen)).toBe('invalid');
});

test('test newCanvasSize()', () => {

    expect(newCanvasSize(3, 4, 0).map(each => Math.round(each))).toEqual([3, 4]);
    expect(newCanvasSize(3, 4, 90).map(each => Math.round(each))).toEqual([4, 3]);
    expect(newCanvasSize(3, 4, 180).map(each => Math.round(each))).toEqual([3, 4]);
    expect(newCanvasSize(3, 4, 270).map(each => Math.round(each))).toEqual([4, 3]);
    expect(newCanvasSize(3, 4, -90).map(each => Math.round(each))).toEqual([4, 3]);
})
