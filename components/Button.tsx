import type { ButtonProps } from 'semantic-ui-react';

import React from 'react';
import { Button } from 'semantic-ui-react';
import { omit } from 'lodash';

interface AppButtonProps extends ButtonProps {
  onClick?: () => Promise<any>;
}

const AppButton = (props: AppButtonProps) => {
  const [_loading, setLoading] = React.useState(false);

  const memoizedLoading = React.useMemo(() => props.loading || _loading, [_loading, props.loading]);

  const buttonProps = React.useMemo(() => omit(props, ['loading', 'onClick']), [props]);

  const onClick = () => {
    if (props.disabled || memoizedLoading) {
      return;
    }

    if (props.onClick) {
      setLoading(true);
      props.onClick().finally(() => setLoading(false));
    }
  };

  return (
    <Button
      {...buttonProps}
      loading={_loading}
      onClick={onClick}
    >
      {props.children}
    </Button>
  );
};

export default AppButton;

// import React from 'react';
// interface ButtonProps {
//   onClick: () => Promise<any>;
//   variant?: 'outline' | 'solid' | 'light' | 'ghost' | 'link';
//   color?: 'orange' | 'green' | 'red' | 'purple' | 'pink' | 'blue';
//   disabled?: boolean;
//   loading?: boolean;
// }

// const Button: React.FC<ButtonProps> = props => {
//   return (
//     <button
//       aria-disabled={props.disabled}
//       data-variant={props.variant}
//       data-color={props.color}
//       className="px-4 py-2"
//     >
//       {props.children}
//     </button>
//   );
// };

// Button.defaultProps = {
//   color: 'green',
//   variant: 'outline'
// };

// export default Button;
