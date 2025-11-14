import React, { useMemo } from "react";
import Select, { components } from "react-select";
import { COUNTRY_DATA } from "@/utils/countries";

const CountryOption = ({ children, ...props }) => {
  return (
    <components.Option {...props}>
      <div className="flex items-center w-full cursor-pointer">
        <div className="flex items-center gap-3">
          <span className="text-2xl leading-none">{props.data.flag}</span>
          <span className="text-gray-500 font-medium text-sm tracking-wider">
            {props.data.code}
          </span>
        </div>
      </div>
    </components.Option>
  );
};

const CountrySingleValue = ({ children, ...props }) => (
  <components.SingleValue {...props}>
    <div className="flex items-center gap-2">
      {/* <span className="text-2xl leading-none">{props.data.flag}</span> */}
      <span className="font-semibold text-gray-700">{props.data.code}</span>
    </div>
  </components.SingleValue>
);

export const CountryCodeSelect = ({ value, onChange, isInvalid = false }) => {
  const options = useMemo(
    () =>
      COUNTRY_DATA.map((c) => ({
        value: c.code,
        label: `${c.name} (${c.code})`, // الـ Label ده مهم للبحث
        flag: c.flag,
        code: c.code,
      })),
    []
  );

  const selectedOption = useMemo(
    () => options.find((opt) => opt.value === value) || null,
    [options, value]
  );

  const customStyles = useMemo(
    () => ({
      control: (base, state) => ({
        ...base,
        minHeight: "50px",
        height: "50px",
        borderColor: isInvalid
          ? "#EF4444" // Red-500
          : state.isFocused
          ? "#000"
          : "#E5E7EB", // Gray-200
        borderRadius: "10px",
        boxShadow: "none",
        backgroundColor: "white",
        cursor: "pointer",
        "&:hover": {
          borderColor: isInvalid ? "#EF4444" : "#000",
        },
      }),
      valueContainer: (base) => ({
        ...base,
        padding: "0 12px",
      }),
      input: (base) => ({
        ...base,
        margin: 0,
        padding: 0,
      }),
      indicatorSeparator: () => ({
        display: "none",
      }),
      dropdownIndicator: (base) => ({
        ...base,
        color: "#6B7280",
        paddingRight: "12px",
        "&:hover": { color: "#111827" },
      }),
      menu: (base) => ({
        ...base,
        marginTop: "8px",
        borderRadius: "12px",
        boxShadow:
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        overflow: "hidden",
        zIndex: 50, // مهم عشان يظهر فوق الفورم
      }),
      menuList: (base) => ({
        ...base,
        padding: "4px",
      }),
      option: (base, state) => ({
        ...base,
        backgroundColor: state.isSelected
          ? "#F3F4F6"
          : state.isFocused
          ? "#F9FAFB"
          : "white",
        color: "#1F2937",
        borderRadius: "8px",
        padding: "10px 12px",
        margin: "2px 0",
        cursor: "pointer",
        transition: "all 0.2s ease",
      }),
    }),
    [isInvalid]
  );

  return (
    <Select
      value={selectedOption}
      onChange={(selected) => onChange(selected ? selected.value : "")}
      options={options}
      isSearchable={true}
      isClearable={false}
      placeholder="Code"
      styles={customStyles}
      components={{
        Option: CountryOption,
        SingleValue: CountrySingleValue,
      }}
      className="w-full font-sans"
      classNamePrefix="react-select"
    />
  );
};