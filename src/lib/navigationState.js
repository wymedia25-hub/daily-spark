let _direction = 'none';

export const setNavDirection = (d) => { _direction = d; };
export const getNavDirection = () => _direction;

export const TAB_ROOTS = ['/', '/explore', '/profile'];
export const isTabRoot = (path) => TAB_ROOTS.includes(path);