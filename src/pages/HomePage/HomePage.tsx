import * as React from 'react';
import { Header } from '../../components';

export function HomePage() {
  return (
    <React.Fragment>
      <Header />
      <div className="p-3">
        <div className="card p-3">Hello World</div>
      </div>
    </React.Fragment>
  );
}
