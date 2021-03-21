import styles from './style.scss'

let debugDiv = null;

const addDebugDiv = () => {
  if (debugDiv === null) {
    const el = document.createElement('div');
    el.className = styles.debugText;
    document.body.appendChild(el);
    debugDiv = el;
  }
  return debugDiv;
}

export { addDebugDiv }
