import React from 'react';

type Props = React.PropsWithChildren<{
  on: string;
}>;

export function Switch({
  children,
  on,
}: Props): JSX.Element | null {
  const matches: React.ReactElement[] = [];
  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child)) {
      const tl = child.props.where ?? '';
      const match = tl == on ? child : null;
      if (match) matches.push(React.cloneElement(match, { on }));
    }
  });

  return matches[0] ?? null;
}

type CaseProps = React.PropsWithChildren<{
  where: string;
}>;

export function Case({
  children,
  where,
}: CaseProps): JSX.Element {
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { on: where });
    }
    return child;
  });
  return <>{childrenWithProps}</>;
}