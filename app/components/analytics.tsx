type Props = {
  id: string | null | undefined;
};

export const Analytics = ({ id }: Props) => {
  return (
    <script
      async
      defer
      data-website-id={id || "e5bbb807-d4e2-48a0-bfee-f6e8de0ae557"}
      src="https://analytics.micrantha.com/umami.js"
    ></script>
  );
};
