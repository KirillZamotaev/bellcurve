import React from 'react';

export const Controls = ({
  form = {},
  handleInput,
  handleRefresh,
  className,
}) => (
  <div className={`${className && className + ' '}Controls`}>
    <div className="Controls__item">
      <input
        name="min"
        type="number"
        value={form.min}
        onChange={handleInput}
        placeholder="min"
      />
    </div>
    <div className="Controls__item">
      <input
        name="max"
        type="number"
        value={form.max}
        onChange={handleInput}
        placeholder="max"
      />
    </div>
    <div className="Controls__item">
      <input
        name="mean"
        type="number"
        value={form.mean}
        onChange={handleInput}
        placeholder="mean"
      />
    </div>
    <div className="Controls__item">
      <input
        name="std"
        type="number"
        value={form.std}
        onChange={handleInput}
        placeholder="std"
      />
    </div>
    <div className="Controls__item">
      <button onClick={handleRefresh}>Generate</button>
    </div>
  </div>
);
