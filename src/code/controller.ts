figma.showUI(__html__);

const init = () => {
  figma.ui.postMessage({
    type: 'init',
    message: 'hello',
  });
};

init();
