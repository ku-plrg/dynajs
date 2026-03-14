try {
  delete Math['P' + 'I'];
} catch (e) {
  e instanceof TypeError;
}
