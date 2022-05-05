import { createElement } from "./create";

function getPageWidth() {
  return Math.max(
    document.body.scrollWidth,
    document.documentElement.scrollWidth,
    document.body.offsetWidth,
    document.documentElement.offsetWidth,
    document.documentElement.clientWidth
  );
}

const div = <div hidden />;
document.body.appendChild(div);

export function setClassName(className: string) {
  div.className = className;
}

export function addTooltip(content: HTMLElement, relativeToNode: HTMLElement) {
  function showTooltip() {
    div.hidden = false;
    div.textContent = "";
    div.appendChild(content);

    const { top: relativeTop, left: relativeLeft, width: relativeWidth } = relativeToNode.getBoundingClientRect();
    const { height: divHeight, width: divWidth } = div.getBoundingClientRect();
    const top = relativeTop + window.pageYOffset - divHeight;

    const targetLeft = relativeLeft + window.pageXOffset - (divWidth - relativeWidth) / 2;
    const oneRemSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const left = Math.min(getPageWidth() - oneRemSize - divWidth, Math.max(oneRemSize, targetLeft));

    div.style.top = top + "px";
    div.style.left = left + "px";
  }
  function hideTooltip() {
    div.hidden = true;
  }
  relativeToNode.addEventListener("mouseenter", showTooltip);
  relativeToNode.addEventListener("touchstart", showTooltip);
  relativeToNode.addEventListener("mouseleave", hideTooltip);
  relativeToNode.addEventListener("touchend", hideTooltip);
}
