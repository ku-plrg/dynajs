const no = () => { throw new Error('fs is unavailable in the browser'); };
export default { writeFileSync: no, readFileSync: no, existsSync: () => false, mkdirSync: no };
export const writeFileSync = no, readFileSync = no, existsSync = () => false, mkdirSync = no;
