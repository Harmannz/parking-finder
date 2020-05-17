import argparse
import pandas as pd

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Process car parks data for firebase")
    parser.add_argument("input", type=str, help='filepath of file containing wcc car parks data')
    parser.add_argument("-o", "--output", type=str, help='filepath to write the processed car parks data', default='out.csv')

    args = parser.parse_args()

    imported_car_parks_df = pd.read_csv(args.input)
    car_parks_df = imported_car_parks_df.drop(labels=['X', 'Y'], axis=1)
    car_parks_df.drop_duplicates(inplace=True)
    car_parks_df.to_csv(args.output, index=False)
